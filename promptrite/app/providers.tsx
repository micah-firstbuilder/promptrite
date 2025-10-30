"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import superjson from "superjson";
import { trpc } from "@/app/utils/trpc";

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
  const queryClientRef = (globalThis as any).__qr__ || new QueryClient();
  (globalThis as any).__qr__ = queryClientRef;
  const trpcClientRef =
    (globalThis as any).__trpc__ ||
    trpc.createClient({
      links: [
        loggerLink({ enabled: () => process.env.NODE_ENV === "development" }),
        httpBatchLink({ url: "/api/trpc", transformer: superjson }),
      ],
    });
  (globalThis as any).__trpc__ = trpcClientRef;

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return (
      <trpc.Provider client={trpcClientRef} queryClient={queryClientRef}>
        <QueryClientProvider client={queryClientRef}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <DebugAuthState />
      <trpc.Provider client={trpcClientRef} queryClient={queryClientRef}>
        <QueryClientProvider client={queryClientRef}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </ClerkProvider>
  );
}
