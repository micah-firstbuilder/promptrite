import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Edge Runtime compatibility
  serverExternalPackages: ['@clerk/nextjs'],
  // Configure headers for Edge compatibility
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Edge-Runtime',
            value: 'true',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
