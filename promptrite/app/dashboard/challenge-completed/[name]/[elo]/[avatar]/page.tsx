"use client";

import { CheckCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEffect as useClientEffect } from "react";

function ChallengeCompletedContent() {
  const router = useRouter();
  const params = useParams();

  // Decode URL parameters and provide defaults

  // Always prefer signed-in user; ignore URL params to avoid stale data
  const [userName, setUserName] = useState("");
  const [userElo, setUserElo] = useState<number>(0);
  const [userAvatar, setUserAvatar] = useState("");

  // Hydrate from /api/user for real data
  useEffect(() => {
    const hydrate = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (res.ok) {
          const u = await res.json();
          setUserName(`${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.username || u.email);
          setUserElo(u.elo_rating ?? 1200);
          setUserAvatar("/aipreplogo.png");
        }
      } catch {}
    };
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  const [displayElo, setDisplayElo] = useState(0);
  const initials = (userName || "")
    .trim()
    .split(/\s+/)
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

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
              <p className="font-medium text-sm">{userName || "You"}</p>
              <p className="text-muted-foreground text-xs">Elo {userElo || 1200}</p>
            </div>
            <div
              aria-label="User initials"
              className="flex size-10 items-center justify-center rounded-full border border-border bg-muted font-semibold"
              role="img"
            >
              {initials}
            </div>
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
              <div
                aria-label="User initials"
                className="flex size-14 items-center justify-center rounded-full border border-border bg-muted font-semibold text-lg"
                role="img"
              >
                {initials}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{userName || "You"}</p>
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
