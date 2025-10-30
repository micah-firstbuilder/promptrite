"use client";

import { CheckCircle, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { trpc } from "@/app/utils/trpc";
import {
  ErrorState,
  LoadingState,
  ScoreSummary,
} from "@/components/score/ScoreSummary";
import { TechnicalModeBadge } from "@/components/technical-mode-badge";
import { Button } from "@/components/ui/button";
import type { ScoringResponse } from "@/lib/services/gateway";
import { track } from "@/lib/utils/analytics";

function ChallengeCompletedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get challenge and attempt info from URL params
  const challengeId = searchParams.get("challengeId");
  const attemptId = searchParams.get("attemptId");

  // Decode URL parameters and provide defaults
  // Always prefer signed-in user; ignore URL params to avoid stale data
  const [userName, setUserName] = useState("");
  const [userElo, setUserElo] = useState<number>(0);
  const [userAvatar, setUserAvatar] = useState("");

  // Scoring state
  const [scoringResult, setScoringResult] = useState<ScoringResponse | null>(
    null
  );
  const [scoringError, setScoringError] = useState<string | null>(null);
  const [isLoadingScoring, setIsLoadingScoring] = useState(false);
  const [improvement, setImprovement] = useState<number | undefined>();

  // Hydrate from /api/user for real data
  const { data: me } = trpc.user.me.useQuery(undefined, { staleTime: 30_000 });

  // Fetch progress data for scoring recovery
  const { data: progressData } = trpc.progress.list.useQuery(undefined, {
    enabled: !!challengeId && !attemptId,
    staleTime: 30_000,
  });

  // Fetch challenge data for mode badge
  const { data: challenge } = trpc.challenges.getById.useQuery(
    { id: Number.parseInt(challengeId || "", 10) },
    { enabled: !!challengeId }
  );

  // Scoring mutation for retry functionality
  const scoringMutation = trpc.scoring.scoreConversation.useMutation();

  useEffect(() => {
    if (me) {
      setUserName(
        `${me.first_name ?? ""} ${me.last_name ?? ""}`.trim() ||
          me.username ||
          me.email
      );
      setUserElo(me.elo_rating ?? 1200);
      setUserAvatar("/aipreplogo.png");
    }
  }, [me]);

  // Load scoring results or compute them on the page
  useEffect(() => {
    const loadScoringResults = async () => {
      if (!challengeId) return;

      setIsLoadingScoring(true);
      setScoringError(null);

      try {
        // First try sessionStorage for immediate results
        if (attemptId && typeof window !== "undefined") {
          const storedResult = sessionStorage.getItem(`scoring:${attemptId}`);
          if (storedResult) {
            const result = JSON.parse(storedResult) as ScoringResponse;
            setScoringResult(result);
            setIsLoadingScoring(false);
            return;
          }

          // If we have conversation stored but no scoring result, compute it now
          const storedConversation = sessionStorage.getItem(
            `scoringConv:${attemptId}`
          );
          if (storedConversation) {
            const conversation = JSON.parse(storedConversation);

            // Call scoring mutation to compute the score
            const result = await scoringMutation.mutateAsync({
              challengeId,
              conversation,
              attemptId,
            });

            // Store result in sessionStorage for future loads
            sessionStorage.setItem(
              `scoring:${attemptId}`,
              JSON.stringify(result)
            );

            setScoringResult(result);
            setIsLoadingScoring(false);
            return;
          }
        }

        // Fallback: fetch from progress data
        if (progressData && progressData.length > 0) {
          const challengeIdNum = Number.parseInt(challengeId, 10);

          // Find progress entries for this challenge
          const challengeProgress = progressData
            .filter((p) => p.challenge_id === challengeIdNum)
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );

          if (challengeProgress.length > 0) {
            const latestProgress = challengeProgress[0];

            // Check if metadata contains scoring result
            if (
              latestProgress.metadata &&
              typeof latestProgress.metadata === "object"
            ) {
              const metadata = latestProgress.metadata as any;
              if (metadata.scoringResult) {
                setScoringResult(metadata.scoringResult as ScoringResponse);

                // Calculate improvement vs previous attempt
                if (challengeProgress.length > 1) {
                  const previousProgress = challengeProgress[1];
                  if (
                    previousProgress.metadata &&
                    typeof previousProgress.metadata === "object"
                  ) {
                    const prevMetadata = previousProgress.metadata as any;
                    if (prevMetadata.scoringResult?.compositeScore) {
                      const improvementValue =
                        metadata.scoringResult.compositeScore -
                        prevMetadata.scoringResult.compositeScore;
                      if (improvementValue > 0) {
                        setImprovement(improvementValue);
                      }
                    }
                  }
                }

                setIsLoadingScoring(false);
                return;
              }
            }
          }
        }

        // No scoring data found
        setScoringError("No scoring data available for this challenge.");
        setIsLoadingScoring(false);
      } catch (error) {
        console.error("Failed to load scoring results:", error);
        setScoringError("Failed to load scoring results.");
        setIsLoadingScoring(false);
      }
    };

    loadScoringResults();
    // Note: scoringMutation is intentionally excluded from deps as tRPC mutations are stable references
    // and including them causes infinite re-renders
  }, [challengeId, attemptId, progressData]);

  // Retry scoring function
  const handleRetryScoring = async () => {
    if (!(attemptId && challengeId) || typeof window === "undefined") return;

    setIsLoadingScoring(true);
    setScoringError(null);

    const retryStartTime = Date.now();

    try {
      // Get stored conversation
      const storedConversation = sessionStorage.getItem(
        `scoringConv:${attemptId}`
      );
      if (!storedConversation) {
        throw new Error("No conversation data available for retry");
      }

      const conversation = JSON.parse(storedConversation);

      // Emit retry analytics with start time
      track("scoring_retry", {
        challengeId: Number.parseInt(challengeId, 10),
        attemptId,
        startTime: retryStartTime,
      });

      // Retry scoring with a new attempt ID
      const newAttemptId = `${attemptId}-retry-${Date.now()}`;
      const result = await scoringMutation.mutateAsync({
        challengeId,
        conversation,
        attemptId: newAttemptId,
      });

      // Calculate retry latency
      const retryLatency = Date.now() - retryStartTime;

      // Store new results in sessionStorage
      sessionStorage.setItem(`scoring:${newAttemptId}`, JSON.stringify(result));
      sessionStorage.setItem(
        `scoringConv:${newAttemptId}`,
        JSON.stringify(conversation)
      );

      // Update URL with new attempt ID
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("attemptId", newAttemptId);
      window.history.replaceState({}, "", newUrl.toString());

      // Emit retry success analytics
      track("scoring_success", {
        challengeId: Number.parseInt(challengeId, 10),
        compositeScore: result.compositeScore,
        attemptId: newAttemptId,
        latency: retryLatency,
        isRetry: true,
      });

      setScoringResult(result);
      setIsLoadingScoring(false);

      // Move focus to the score summary after successful retry
      setTimeout(() => {
        const scoreSummaryElement = document.querySelector(
          '[aria-label="Score Summary"]'
        );
        if (scoreSummaryElement) {
          scoreSummaryElement.scrollIntoView({ behavior: "smooth" });
          (scoreSummaryElement as HTMLElement).focus();
        }
      }, 100);
    } catch (error) {
      console.error("Retry scoring failed:", error);

      // Calculate latency even for failed retry requests
      const retryLatency = Date.now() - (retryStartTime || Date.now());

      // Emit retry failure analytics
      track("scoring_failure", {
        challengeId: Number.parseInt(challengeId, 10),
        attemptId,
        error: error instanceof Error ? error.message : String(error),
        latency: retryLatency,
        isRetry: true,
      });

      setScoringError("Retry failed. Please try again later.");
      setIsLoadingScoring(false);
    }
  };

  // Status function (placeholder)
  const handleStatus = () => {
    // Could navigate to a status page or show a modal
    console.log("Status clicked");
  };

  const [displayElo, setDisplayElo] = useState(0);
  const initials =
    (userName || "")
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
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[22px] leading-6 tracking-tight">
                  Daily Challenge
                </p>
                {challenge && (
                  <TechnicalModeBadge mode={challenge.technicalMode} />
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                Challenge completed successfully
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-sm">{userName || "You"}</p>
              <p className="text-muted-foreground text-xs">
                Elo {userElo || 1200}
              </p>
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

        {/* Scoring Results */}
        {challengeId && (
          <div className="mt-8 w-full">
            {isLoadingScoring ? (
              <LoadingState />
            ) : scoringError ? (
              <ErrorState
                onRetry={attemptId ? handleRetryScoring : undefined}
                onStatus={handleStatus}
              />
            ) : scoringResult ? (
              <ScoreSummary
                improvement={improvement}
                onRetry={attemptId ? handleRetryScoring : undefined}
                onStatus={handleStatus}
                onViewElo={() => {
                  const userNameEncoded = encodeURIComponent(userName || "You");
                  const userEloEncoded = encodeURIComponent(
                    String(userElo || 1200)
                  );
                  const userAvatarEncoded = encodeURIComponent(
                    userAvatar || "/aipreplogo.png"
                  );
                  router.push(
                    `/dashboard/challenge-completed/${userNameEncoded}/${userEloEncoded}/${userAvatarEncoded}`
                  );
                }}
                result={scoringResult}
              />
            ) : null}
          </div>
        )}
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
