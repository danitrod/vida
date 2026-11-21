import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Never copy local drafts into server bundles, even when building locally.
  outputFileTracingExcludes: { "*": ["src/content/drafts/**"] },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
