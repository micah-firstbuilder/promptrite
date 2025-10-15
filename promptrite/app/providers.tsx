"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from '@trpc/client';
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import superjson from "superjson";
import { trpc } from "../lib/trpc/client";

function DebugAuthState() {
  const { isLoaded, isSignedIn, userId, sessionId } = useAuth();
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    // eslint-disable-next-line no-console
    console.log("[providers] auth state", {
      isLoaded,
      isSignedIn,
      userId,
      sessionId,
    });
  }, [isLoaded, isSignedIn, userId, sessionId]);
  return null;
}

export function Providers({ children }: PropsWithChildren) {
  // Create React Query client and tRPC client
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
        }),
      ],
    })
  );

  // If Clerk isn't configured, render children without the provider
  // to avoid client-side runtime errors that blank the page.
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return <>{children}</>;

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ClerkProvider publishableKey={publishableKey}>
          <DebugAuthState />
          {children}
        </ClerkProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
