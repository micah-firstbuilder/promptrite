"use client";


import type { PropsWithChildren } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { trpc } from "@/app/utils/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";

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

  const queryClient = new QueryClient();
  const trpcClient = trpc.createClient({
    links: [
      loggerLink({ enabled: () => process.env.NODE_ENV === "development" }),
      httpBatchLink({ url: "/api/trpc", transformer: superjson }),
    ],
  });

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <DebugAuthState />
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </trpc.Provider>
    </ClerkProvider>
  );


}


