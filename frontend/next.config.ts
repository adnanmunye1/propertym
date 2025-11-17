import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Disable telemetry
  experimental: {
    instrumentationHook: false,
  },
};

export default nextConfig;
