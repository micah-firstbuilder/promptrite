import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { createContext } from "@/app/server/context";
import { appRouter } from "@/app/server/routers/_app";

export const runtime = "nodejs";

// Export API handler for GET and POST
export const GET = async (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export const POST = async (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });
