import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import { ClientProviders } from "./client-providers";

// remove second analytics

// Re-enabling 'force-dynamic' to prevent static generation issues with Clerk
export const dynamic = "force-dynamic";

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
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {publishableKey ? (
          <ClerkProvider publishableKey={publishableKey}>
            <ClientProviders>
              <Suspense fallback={<div>Loading...</div>}>
                {children}
                <Analytics />
                <Toaster />
              </Suspense>
            </ClientProviders>
          </ClerkProvider>
        ) : (
          <ClientProviders>
            <Suspense fallback={<div>Loading...</div>}>
              {children}
              <Analytics />
              <Toaster />
            </Suspense>
          </ClientProviders>
        )}
      </body>
    </html>
  );
}
