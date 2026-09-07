import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: process.env.STATIC_EXPORT === "true" ? "export" : undefined,
  trailingSlash: process.env.STATIC_EXPORT === "true",
};

export default nextConfig;
