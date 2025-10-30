import { clerkMiddleware } from "@clerk/nextjs/server";

// Simplest configuration to ensure Clerk wires auth context

export default clerkMiddleware();

export const config = {
  // Apply Clerk middleware to all app and API routes (exclude _next and static files)
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
