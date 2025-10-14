import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Edge Runtime compatibility
  serverExternalPackages: ['@clerk/nextjs'],
  // Removed explicit Edge headers to allow Next.js to handle runtime automatically
  // This can help with SSR/SSG compatibility on Vercel
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
