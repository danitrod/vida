import { createHmac } from "crypto";
import { headers } from "next/headers";
import { after, userAgent } from "next/server";
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
  // External referrer domain ("instagram.com"), or "self" when a full load
  // came from this site (refresh, new tab). Absent when there is none.
  referrer?: string;
  utm?: Partial<Record<(typeof UTM_KEYS)[number], string>>;
  // Ad/social click-ID params on the URL with their values, e.g.
  // { igsh: "…" }. Group by value to count views per share/click.
  clickIds?: Record<string, string>;
  // Social app whose in-app browser opened the page.
  inApp?: string;
  device: string;
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
// the rest: Google, TikTok, X, Microsoft, LinkedIn.
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

const IN_APP_BROWSERS: [RegExp, string][] = [
  [/Instagram/i, "instagram"],
  [/Barcelona/, "threads"],
  [/FBAN|FBAV|FB_IAB|FBIOS/, "facebook"],
  [/musical_ly|Bytedance|TikTok/i, "tiktok"],
  [/LinkedInApp/i, "linkedin"],
  [/Twitter/i, "twitter"],
];

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
  const ua = h.get("user-agent") ?? "";
  const parsed = userAgent({ headers: h });
  if (!ua.startsWith("Mozilla/") || parsed.isBot) {
    return debug("skip bot", ua, path);
  }

  const view: PageView = {
    ts: new Date(),
    meta: { path },
    nav: isInternal ? "internal" : "landing",
    device: parsed.device.type ?? "desktop",
  };
  if (parsed.browser.name) view.browser = parsed.browser.name;
  if (parsed.os.name) view.os = parsed.os.name;

  const inApp = IN_APP_BROWSERS.find(([re]) => re.test(ua));
  if (inApp) view.inApp = inApp[1];

  if (!isInternal) {
    const referrer = referrerDomain(h.get("referer"), h.get("host"));
    if (referrer) view.referrer = referrer;

    const utm: PageView["utm"] = {};
    for (const key of UTM_KEYS) {
      const value = param(searchParams, key);
      if (value) utm[key] = value;
    }
    if (Object.keys(utm).length) view.utm = utm;

    const clickIds: Record<string, string> = {};
    for (const key of CLICK_ID_KEYS) {
      // Present without a value (e.g. "?igsh") is still recorded.
      if (key in searchParams) clickIds[key] = param(searchParams, key, 200) ?? "";
    }
    if (Object.keys(clickIds).length) view.clickIds = clickIds;
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
      // NamespaceExists: already created (possibly before retention was
      // added). Make sure it expires old views; never block on failure.
      await db
        .command({ collMod: COLLECTION, expireAfterSeconds: RETENTION_SECONDS })
        .catch((e) => console.error("Analytics retention update failed:", e));
    });
  await ready;
  return db.collection<PageView>(COLLECTION);
}
