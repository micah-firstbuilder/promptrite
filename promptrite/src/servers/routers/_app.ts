// Align legacy path with the primary app router to avoid drift.
export { appRouter } from "@/app/server/routers/_app";
export type AppRouter = typeof import("@/app/server/routers/_app").appRouter;
