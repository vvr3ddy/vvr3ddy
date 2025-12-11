import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Removed to enable dynamic API routes
  images: {
    unoptimized: true,
  },
  // Ensure we don't have strict mode issues with some older MDX plugins
  reactStrictMode: true,
};

export default nextConfig;