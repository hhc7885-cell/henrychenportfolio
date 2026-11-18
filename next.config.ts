import type { NextConfig } from "next";

const pages = process.env.GITHUB_PAGES_BUILD === "true";
const nextConfig: NextConfig = {
  devIndicators: false,
  output: pages ? "export" : "standalone",
  basePath: pages ? process.env.NEXT_PUBLIC_BASE_PATH || "" : "",
  trailingSlash: pages,
  images: { unoptimized: pages },
};

export default nextConfig;
