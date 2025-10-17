import { clerkMiddleware } from "@clerk/nextjs/server";

// Simplest configuration to ensure Clerk wires auth context

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", 
    "/", 
    "/(api(?!/trpc).*)(.*)"],
};
