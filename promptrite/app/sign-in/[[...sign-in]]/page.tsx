"use client";

import { SignIn, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";


export default function Page() {
  const { isLoaded, isSignedIn, userId, sessionId } = useAuth();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    // eslint-disable-next-line no-console
    console.log("[signin] auth state", { isLoaded, isSignedIn, userId, sessionId });
  }, [isLoaded, isSignedIn, userId, sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SignIn redirectUrl="/dashboard" />
    </div>
  );
}
