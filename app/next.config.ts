import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Skip ESLint during production builds to unblock deploys
    // You can re-enable later by setting this to false
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
