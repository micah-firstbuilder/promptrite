import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";

// Re-enabling 'force-dynamic' to prevent static generation issues with Clerk
export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIPREP — The Rite of Passage to AI Mastery",
  description:
    "Play real AI challenges, learn how to prompt like a pro, and earn your AI ELO score to track your progress.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
            <Analytics />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
