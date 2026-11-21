import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import createMDX from "@next/mdx";

const withMDX = createMDX({});

export default function config(phase: string): NextConfig {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;

  return withMDX({
    pageExtensions: [
      "js",
      "jsx",
      "md",
      "mdx",
      "ts",
      "tsx",
      // Dev-only routes (e.g. serving draft photos) are named *.dev.ts and
      // only exist under `next dev`; production builds never see them.
      ...(isDevServer ? ["dev.ts"] : []),
    ],
    // Never copy local drafts into server bundles, even when building locally.
    outputFileTracingExcludes: { "*": ["src/content/drafts/**"] },
  });
}
