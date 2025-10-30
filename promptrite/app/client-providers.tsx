"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import type { PropsWithChildren } from "react";
import superjson from "superjson";
import { trpc } from "@/app/utils/trpc";

export function ClientProviders({ children }: PropsWithChildren) {
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

  return (
    <trpc.Provider client={trpcClientRef} queryClient={queryClientRef}>
      <QueryClientProvider client={queryClientRef}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
