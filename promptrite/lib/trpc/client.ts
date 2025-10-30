import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../src/servers/routers/_app";

// Create TRPC client for React Query usage
export const trpc = createTRPCReact<AppRouter>();

// Create a standalone TRPC client (useful for direct calls outside React components)
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser should use relative URL
    return "";
  }

  // SSR should use vercel url
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

// Export the TRPC client links config
export const trpcClientConfig = {
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
};

// For standalone usage
export const trpcClient = createTRPCClient<AppRouter>(trpcClientConfig);
