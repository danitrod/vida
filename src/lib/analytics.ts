import { createHmac } from "crypto";
import { headers } from "next/headers";
import { after, userAgent } from "next/server";
import type { Db } from "mongodb";
import mongo from "@/lib/mongodb";

// Page view analytics.
//
// Call `trackPageView` from a page component *after* the page is known to
// exist (i.e. after any notFound()). Pages, unlike layouts, re-render on
// in-app navigation, so both full loads and client-side navigations are
// counted, while 404s never reach this code.
//
// One document is stored per view in a MongoDB time-series collection, so
// views can be grouped by any time range. Nothing identifying is stored: no
// IP, no cookies. `visitor` is a hash of IP + user agent salted with the
// current UTC day, so it only allows counting unique visitors within a day.

type SearchParams = Record<string, string | string[] | undefined>;

type PageView = {
  ts: Date;
  meta: { path: string };
  // "landing": full page load; "internal": in-app navigation.
  nav: "landing" | "internal";
  // Landing views only. Normalized traffic source ("instagram", "linkedin",
  // "google", or a raw domain / utm_source for anything unmapped), derived
  // from the fields below by `trafficSource`. Absent = direct or unknown.
  source?: string;
  // External referrer domain ("instagram.com"), or "self" when a full load
  // came from this site (refresh, new tab). Absent when there is none.
  referrer?: string;
  // Lowercased values.
  utm?: Partial<Record<(typeof UTM_KEYS)[number], string>>;
  // Names of ad/social click-ID params present on the URL, e.g. ["igsh"].
  // Values are deliberately not stored (they identify a click or a sharer).
  clickParams?: string[];
  // "mobile", "tablet", "desktop", "smarttv", ... or "unknown".
  device: string;
  // Parsed browser name; in-app browsers are reported as the app
  // ("Instagram", "Threads", "LinkedIn", ...). The single source of truth for
  // in-app detection (older documents also have a separate `inApp` field).
  browser?: string;
  os?: string;
  visitor?: string;
};

const COLLECTION = "pageviews";

// Views are deleted automatically after 2 years (stated in the privacy page,
// /privacidade). Keep both in sync.
const RETENTION_SECONDS = 2 * 365 * 24 * 60 * 60;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

// fbclid: Facebook/Instagram ads & links; igsh/igshid: Instagram share links;
// the rest: Google, TikTok, X, Microsoft, LinkedIn. Only their presence is
// recorded (see `clickParams`).
const CLICK_ID_KEYS = [
  "fbclid",
  "igsh",
  "igshid",
  "gclid",
  "ttclid",
  "twclid",
  "msclkid",
  "li_fat_id",
];

// In-app browsers, as reported in `browser`. Next's parser already names most
// of them, but not consistently (or at all for Threads/X), so these win.
// Threads first: its user agent may also carry Instagram's token.
const IN_APP_BROWSERS: [RegExp, string][] = [
  [/Barcelona/, "Threads"],
  [/Instagram/i, "Instagram"],
  [/FBAN|FBAV|FB_IAB|FBIOS/, "Facebook"],
  [/musical_ly|Bytedance|TikTok/i, "TikTok"],
  [/LinkedInApp/i, "LinkedIn"],
  [/Twitter/i, "X"],
];

// Canonical traffic sources. Each matches utm_source values and referrer
// hosts: a domain matches itself and its subdomains, and Android apps send
// their package name as referrer ("android-app://com.linkedin.android/").
const SOURCES: { source: string; utm: string[]; hosts: string[] }[] = [
  { source: "threads", utm: ["threads"], hosts: ["threads.net", "threads.com", "com.instagram.barcelona"] },
  { source: "instagram", utm: ["ig", "instagram"], hosts: ["instagram.com", "com.instagram.android"] },
  { source: "facebook", utm: ["fb", "facebook"], hosts: ["facebook.com", "fb.com", "messenger.com", "com.facebook.katana", "com.facebook.orca"] },
  { source: "linkedin", utm: ["linkedin", "li"], hosts: ["linkedin.com", "lnkd.in", "com.linkedin.android"] },
  { source: "x", utm: ["x", "twitter"], hosts: ["x.com", "twitter.com", "t.co", "com.twitter.android"] },
  { source: "tiktok", utm: ["tiktok"], hosts: ["tiktok.com", "com.zhiliaoapp.musically"] },
  { source: "whatsapp", utm: ["whatsapp", "wa"], hosts: ["whatsapp.com", "wa.me", "com.whatsapp"] },
  { source: "gmail", utm: ["gmail"], hosts: ["mail.google.com", "com.google.android.gm"] },
  { source: "google", utm: ["google"], hosts: ["com.google.android.googlequicksearchbox"] },
  { source: "reddit", utm: ["reddit"], hosts: ["reddit.com"] },
  { source: "bing", utm: ["bing"], hosts: ["bing.com"] },
  { source: "duckduckgo", utm: ["duckduckgo", "ddg"], hosts: ["duckduckgo.com"] },
];

// Desktop OSes: the parser leaves `device.type` empty for desktops, but also
// for anything it doesn't recognize.
const DESKTOP_OS = /^(Mac OS|Windows|Linux|Ubuntu|Debian|Fedora|Arch|Mint|Manjaro|Chrome OS|Chromium OS|FreeBSD|OpenBSD)$/i;

const debug = (...args: unknown[]) => {
  if (process.env.ANALYTICS_DEBUG === "1") console.log("[analytics]", ...args);
};

export async function trackPageView(
  path: string,
  searchParams: SearchParams
): Promise<void> {
  const h = await headers();
  // Browser speculative prefetch/prerender is not a view. (Next's own <Link>
  // prefetches never get here: dynamic pages are not rendered for them, and
  // Next strips its router headers before pages see the request.)
  const purpose = `${h.get("sec-purpose") ?? ""} ${h.get("purpose") ?? ""}`;
  if (/prefetch|prerender/i.test(purpose)) {
    return debug("skip prefetch", path);
  }

  // Classify with the browser's Fetch Metadata headers, sent by every
  // browser Next supports (including in-app webviews), but not by scripts:
  // - full page load: sec-fetch-dest "document"
  // - in-app navigation: Next's router fetch() from our own page, so
  //   sec-fetch-dest "empty" and sec-fetch-site "same-origin"
  // Anything else (iframes, images, curl, missing headers) is not counted.
  const dest = h.get("sec-fetch-dest");
  const site = h.get("sec-fetch-site");
  let isInternal: boolean;
  if (dest === "document") isInternal = false;
  else if (dest === "empty" && site === "same-origin") isInternal = true;
  else return debug("skip non-navigation", dest, site, path);

  // Bots, crawlers and scripts. Every real browser (in-app ones included)
  // sends a "Mozilla/..." user agent; curl, wget, python-requests... do not.
  // Headless/automation browsers (Puppeteer, Playwright, Lighthouse) aren't
  // on Next's bot list but say so in the user agent.
  const ua = h.get("user-agent") ?? "";
  const parsed = userAgent({ headers: h });
  if (
    !ua.startsWith("Mozilla/") ||
    parsed.isBot ||
    /Headless|Lighthouse|PhantomJS/i.test(ua)
  ) {
    return debug("skip bot", ua, path);
  }

  const view: PageView = {
    ts: new Date(),
    meta: { path },
    nav: isInternal ? "internal" : "landing",
    device:
      parsed.device.type ??
      (DESKTOP_OS.test(parsed.os.name ?? "") ? "desktop" : "unknown"),
  };
  const inApp = IN_APP_BROWSERS.find(([re]) => re.test(ua))?.[1];
  const browser = inApp ?? parsed.browser.name;
  if (browser) view.browser = browser;
  if (parsed.os.name) view.os = parsed.os.name;

  if (!isInternal) {
    const referrer = referrerDomain(h.get("referer"), h.get("host"));
    if (referrer) view.referrer = referrer;

    const utm: PageView["utm"] = {};
    for (const key of UTM_KEYS) {
      const value = param(searchParams, key)?.toLowerCase();
      if (value) utm[key] = value;
    }
    if (Object.keys(utm).length) view.utm = utm;

    // Present without a value (e.g. "?igsh") still counts.
    const clickParams = CLICK_ID_KEYS.filter((key) => key in searchParams);
    if (clickParams.length) view.clickParams = clickParams;

    const source = trafficSource(inApp, view.utm?.utm_source, clickParams, referrer);
    if (source) view.source = source;
  }

  const visitor = visitorHash(h.get("x-forwarded-for") ?? h.get("x-real-ip"), ua);
  if (visitor) view.visitor = visitor;

  debug("record", JSON.stringify(view));

  // Written after the response is sent; never delays the page.
  after(async () => {
    try {
      const collection = await pageViews();
      await collection.insertOne(view);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  });
}

function param(
  searchParams: SearchParams,
  key: string,
  maxLength = 100
): string | undefined {
  const raw = searchParams[key];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return value ? value.slice(0, maxLength) : undefined;
}

// Ad click IDs that, alone, still say where the click came from.
const CLICK_ID_SOURCES: Record<string, string> = {
  igsh: "instagram",
  igshid: "instagram",
  gclid: "google",
  ttclid: "tiktok",
  twclid: "x",
  msclkid: "bing",
  li_fat_id: "linkedin",
  // Added by both Facebook and Instagram outbound links, so ambiguous.
  fbclid: "meta",
};

// Most to least reliable: the app the page opened in (observed), an explicit
// utm_source, an Instagram share ID, the referrer, then other click IDs.
// Unmapped utm_source values and referrer domains are kept as they are.
function trafficSource(
  inApp: string | undefined,
  utmSource: string | undefined,
  clickParams: string[],
  referrer: string | undefined
): string | undefined {
  if (inApp) return inApp.toLowerCase();
  if (utmSource) {
    return SOURCES.find((s) => s.utm.includes(utmSource))?.source ?? utmSource;
  }
  if (clickParams.includes("igsh") || clickParams.includes("igshid")) {
    return "instagram";
  }
  if (referrer && referrer !== "self") {
    const known = SOURCES.find((s) =>
      s.hosts.some((d) => referrer === d || referrer.endsWith(`.${d}`))
    );
    if (known) return known.source;
    if (/(^|\.)google(\.[a-z]{2,3}){1,2}$/.test(referrer)) return "google";
    return referrer;
  }
  const clickParam = clickParams.find((p) => p in CLICK_ID_SOURCES);
  return clickParam && CLICK_ID_SOURCES[clickParam];
}

function referrerDomain(
  referer: string | null,
  host: string | null
): string | undefined {
  if (!referer) return undefined;
  let hostname: string;
  try {
    hostname = new URL(referer).hostname.toLowerCase();
  } catch {
    return undefined;
  }
  if (!hostname) return undefined;

  const ownHost = host?.split(":")[0].toLowerCase();
  if (ownHost && hostname === ownHost) return "self";

  // l.instagram.com, lm.facebook.com, m.facebook.com, www.google.com, ...
  return hostname.replace(/^(www|m|l|lm)\./, "").slice(0, 100);
}

function visitorHash(forwardedFor: string | null, ua: string) {
  const secret = process.env.JWT_SECRET;
  const ip = forwardedFor?.split(",")[0].trim();
  if (!secret || !ip) return undefined;

  const day = new Date().toISOString().slice(0, 10);
  return createHmac("sha256", secret)
    .update(`pageview:${day}:${ip}:${ua}`)
    .digest("base64url")
    .slice(0, 16);
}

// The collection is created as a time-series collection on first use
// (compact storage, fast time-range queries). Safe across restarts/instances.
let ready: Promise<void> | null = null;

async function pageViews() {
  await mongo.connect();
  const db = mongo.db();
  ready ??= db
    .createCollection(COLLECTION, {
      timeseries: { timeField: "ts", metaField: "meta", granularity: "hours" },
      expireAfterSeconds: RETENTION_SECONDS,
    })
    .then(() => undefined)
    .catch(async (err) => {
      if (err?.code !== 48) {
        ready = null;
        throw err;
      }
      // NamespaceExists: already created, possibly before retention was
      // added. Never block page views on this.
      await ensureRetention(db).catch((e) =>
        console.error("Analytics retention check failed:", e)
      );
    });
  await ready;
  return db.collection<PageView>(COLLECTION);
}

// Adds the expiry to a collection created without it. Reading collection
// options works with the app's read/write role; changing them (collMod)
// needs an admin role, so when that's missing, log the one-time fix.
async function ensureRetention(db: Db) {
  const [info] = await db
    .listCollections({ name: COLLECTION }, { nameOnly: false })
    .toArray();
  const current = (info as { options?: { expireAfterSeconds?: number } })
    ?.options?.expireAfterSeconds;
  if (current === RETENTION_SECONDS) return;

  try {
    await db.command({
      collMod: COLLECTION,
      expireAfterSeconds: RETENTION_SECONDS,
    });
  } catch (err) {
    const code = (err as { code?: number }).code;
    // 13: Unauthorized; 8000: Atlas permission error.
    if (code !== 13 && code !== 8000) throw err;
    console.warn(
      `[analytics] "${db.databaseName}.${COLLECTION}" has no 2-year expiry and ` +
        "this database user can't add it. Run once with an admin user:\n" +
        `  use ${db.databaseName}\n` +
        `  db.runCommand({ collMod: "${COLLECTION}", expireAfterSeconds: ${RETENTION_SECONDS} })`
    );
  }
}
