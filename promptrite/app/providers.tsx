"use client";

import type { PropsWithChildren } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

function DebugAuthState() {
  const { isLoaded, isSignedIn, userId, sessionId } = useAuth();
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    // eslint-disable-next-line no-console
    console.log("[providers] auth state", { isLoaded, isSignedIn, userId, sessionId });
  }, [isLoaded, isSignedIn, userId, sessionId]);
  return null;
}

export function Providers({ children }: PropsWithChildren) {
  // If Clerk isn't configured, render children without the provider
  // to avoid client-side runtime errors that blank the page.
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return <>{children}</>;

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <DebugAuthState />
      {children}
    </ClerkProvider>
  );
}


