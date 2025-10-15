import type { NextConfig } from "next";

// Keep config minimal to allow proper Edge bundling on Vercel
const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},
};

export default nextConfig;
