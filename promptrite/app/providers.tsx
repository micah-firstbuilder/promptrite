"use client";

import type { PropsWithChildren } from "react";
import { ClerkProvider } from "@clerk/nextjs";

export function Providers({ children }: PropsWithChildren) {
  // If Clerk isn't configured, render children without the provider
  // to avoid client-side runtime errors that blank the page.
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return <>{children}</>;

  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}


