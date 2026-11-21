import { userAgent } from "next/server";

// Coarse, human description of the reader's device, in Portuguese, for use
// in post text ("olhando para o seu iPhone"). Every result is a masculine
// noun so it reads naturally after "o seu" / "seu".
//
// Privacy: only the User-Agent request header (which every browser sends) is
// read, on the server, while rendering. The result is not stored, logged or
// combined with anything, and only a broad category is produced (no model,
// no versions).

export const DEVICE_FALLBACK = "dispositivo";

export function describeDevice(ua: string | null): string {
  // Every real browser (in-app ones included) sends "Mozilla/..."; scripts
  // and tools don't, and get the neutral word.
  if (!ua?.startsWith("Mozilla/")) return DEVICE_FALLBACK;

  const { device, os, isBot } = userAgent({
    headers: new Headers({ "user-agent": ua }),
  });
  if (isBot) return DEVICE_FALLBACK;

  const osName = os.name ?? "";
  const model = device.model ?? "";

  if (model === "iPhone" || (osName === "iOS" && device.type === "mobile")) {
    return "iPhone";
  }
  if (model === "iPad" || (osName === "iOS" && device.type === "tablet")) {
    return "iPad";
  }
  if (osName === "Android") {
    return device.type === "tablet" ? "tablet Android" : "celular Android";
  }
  if (device.type === "mobile") return "celular";
  if (device.type === "tablet") return "tablet";

  // Desktop. Note: iPads on iPadOS 13+ ask for desktop sites and report
  // themselves as a Mac, so they are described as one.
  if (osName === "Mac OS") return "Mac";
  if (osName === "Windows") return "computador Windows";
  if (/^(Chrome|Chromium) OS$/.test(osName)) return "Chromebook";
  if (/Linux|Ubuntu|Debian|Fedora|Arch|Mint|Manjaro/i.test(osName)) {
    return "computador Linux";
  }
  if (!device.type) return "computador";

  return DEVICE_FALLBACK;
}
