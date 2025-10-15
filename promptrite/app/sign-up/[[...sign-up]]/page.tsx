"use client";

import { SignUp, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";


export default function Page() {
  const { isLoaded, isSignedIn, userId, sessionId } = useAuth();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    // Basic client-side visibility into Clerk state
    // eslint-disable-next-line no-console
    console.log("[signup] auth state", { isLoaded, isSignedIn, userId, sessionId });
  }, [isLoaded, isSignedIn, userId, sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SignUp redirectUrl="/dashboard" />
    </div>
  );
}
