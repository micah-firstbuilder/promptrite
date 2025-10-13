"use client";

import { CheckCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function ChallengeCompletedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userName = searchParams.get("name") || "Alex Rivera";
  const userElo = Number(searchParams.get("elo")) || 1824;
  const userAvatar =
    searchParams.get("avatar") ||
    "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=120&auto=format&fit=crop";

  const [displayElo, setDisplayElo] = useState(0);

  useEffect(() => {
    const duration = 4000; // 0.5x speed = 4 seconds
    const startTime = Date.now();
    const targetElo = userElo;

    const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentElo = Math.floor(easedProgress * targetElo);

      setDisplayElo(currentElo);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [userElo]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border border-border">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-[22px] leading-6 tracking-tight">
                Daily Challenge
              </p>
              <p className="text-muted-foreground text-sm">
                Challenge completed successfully
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-sm">{userName}</p>
              <p className="text-muted-foreground text-xs">Elo {userElo}</p>
            </div>
            <Image
              alt="User avatar"
              className="size-10 rounded-full border border-border object-cover"
              height={40}
              src={userAvatar || "/placeholder.svg"}
              width={40}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle className="size-8 text-emerald-600" />
            </div>
          </div>

          {/* Heading */}
          <div className="mt-6 text-center">
            <h1 className="font-semibold text-[32px] tracking-tight">
              Challenge Complete
            </h1>
            <p className="mt-2 text-muted-foreground">
              Great work! You've successfully completed this challenge.
            </p>
          </div>

          {/* User Card */}
          <div className="mt-8 rounded-xl border border-border p-6">
            <div className="flex items-center gap-4">
              <Image
                alt="User avatar"
                className="size-14 rounded-full border border-border object-cover"
                height={56}
                src={userAvatar || "/placeholder.svg"}
                width={56}
              />
              <div className="flex-1">
                <p className="font-semibold text-lg">{userName}</p>
                <p className="text-muted-foreground text-sm">
                  Completed successfully
                </p>
              </div>
            </div>
          </div>

          {/* ELO Display */}
          <div className="mt-6 rounded-xl border border-border p-8 text-center">
            <p className="mb-2 text-muted-foreground text-sm">Your ELO</p>
            <p className="font-bold text-[56px] tabular-nums tracking-tight">
              {displayElo}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between border-border border-t pt-6">
            <p className="text-muted-foreground text-sm">
              Completed{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <Button onClick={() => router.push("/dashboard/challenges")}>
              Continue
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChallengeCompletedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ChallengeCompletedContent />
    </Suspense>
  );
}
