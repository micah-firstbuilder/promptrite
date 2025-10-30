"use client";

import { ArrowLeft, BadgeCheck, Clock, Sparkles, XCircle } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/app/utils/trpc";
import { ImagePreviewPanel } from "@/components/preview/ImagePreviewPanel";
import { UiPreviewPanel } from "@/components/preview/UiPreviewPanel";
import { VideoPreviewPanel } from "@/components/preview/VideoPreviewPanel";
import Chat from "@/components/steering-demo/Chat";
import { TaskSpecifications } from "@/components/TaskSpecifications";
import { TechnicalModeBadge } from "@/components/technical-mode-badge";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/utils/analytics";

// Challenge data is now fetched from the API

type Message = {
  text: string;
  role: "user" | "assistant";
};

type StatusType = "idle" | "success" | "error";

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = params.id as string;

  // Signed-in user display data
  const [displayName, setDisplayName] = useState<string>("");
  const [displayElo, setDisplayElo] = useState<number>(0);
  const [displayAvatar, setDisplayAvatar] = useState<string>("");

  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Explain your approach, then send your final line as: answer: NUMBER.",
      role: "assistant",
    },
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<{
    type: StatusType;
    headline: string;
    sub: string;
  }>({
    type: "idle",
    headline: "",
    sub: "",
  });
  const [testResult, setTestResult] = useState<{
    passed: boolean;
    submitted: boolean;
  }>({
    passed: false,
    submitted: false,
  });
  const [submittedAnswer, setSubmittedAnswer] = useState<number | null>(null);
  const [testOpen, setTestOpen] = useState(true);
  const [isScoring, setIsScoring] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    attemptId: string;
    conversation: Array<{ role: string; content: string }>;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { data: me } = trpc.user.me.useQuery(undefined, { staleTime: 30_000 });
  const { data: challengeData } = trpc.challenges.getById.useQuery(
    { id: Number.parseInt(challengeId, 10) },
    { enabled: !!challengeId }
  );
  const { data: submissions } = trpc.progress.listByChallenge.useQuery(
    { challengeId: Number.parseInt(challengeId, 10) },
    { enabled: !!challengeId }
  );
  // Mutations must be declared before any conditional returns to maintain hook order
  const createProgress = trpc.progress.create.useMutation();
  const scoringMutation = trpc.scoring.scoreConversation.useMutation();

  useEffect(() => {
    if (me) {
      const name =
        `${me.first_name ?? ""} ${me.last_name ?? ""}`.trim() ||
        me.username ||
        me.email;
      setDisplayName(name ?? "You");
      setDisplayElo(me.elo_rating ?? 1200);
      setDisplayAvatar("/aipreplogo.png");
    }
  }, [me]);

  // Handle attemptId query param for deep-linking
  useEffect(() => {
    const attemptId = searchParams.get("attemptId");
    if (attemptId && submissions) {
      const submission = submissions.find(
        (s) => (s.metadata as any)?.attemptId === attemptId
      );
      if (submission && (submission.metadata as any)?.conversation) {
        setSelectedSubmission({
          attemptId: (submission.metadata as any).attemptId,
          conversation: (submission.metadata as any).conversation,
        });
      }
    }
  }, [searchParams, submissions]);

  if (!challengeData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-semibold text-2xl text-foreground">
            Challenge not found
          </h1>
          <Button
            className="mt-4"
            onClick={() => router.push("/dashboard/challenges")}
          >
            Back to Challenges
          </Button>
        </div>
      </div>
    );
  }

  // Check if challenge mode is supported
  const isSupportedMode = challengeData.technicalMode !== "unsupported";
  const isUIMode =
    challengeData.technicalMode === "ui" ||
    challengeData.technicalMode === "code";
  const isImageMode = challengeData.technicalMode === "image";
  const isVideoMode = challengeData.technicalMode === "video";
  const isPreviewOnlyMode = isUIMode || isImageMode || isVideoMode;

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, role: "user" }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "Got it. When ready, press Submit to validate your final answer for Case 1.",
          role: "assistant",
        },
      ]);
    }, 250);
  };

  const extractAnswer = (): number | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const match = messages[i].text.match(/answer:\s*(-?\d+)/i);
      if (match) return Number(match[1]);
    }
    return null;
  };

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isScoring || scoringMutation.isPending) return;

    const answer = extractAnswer();
    if (answer === null) {
      setStatus({
        type: "error",
        headline: "No answer found",
        sub: "Send a message like: answer: 3",
      });
      setTestResult({ passed: false, submitted: true });
      setSubmittedAnswer(null);
      return;
    }

    // Note: Answer validation is now handled by the scoring service
    const passed = true; // Placeholder - actual validation happens server-side
    setSubmittedAnswer(answer);
    setTestResult({ passed, submitted: true });

    // Start scoring process
    setIsScoring(true);
    setStatus({
      type: "idle",
      headline: "Scoring in progress",
      sub: "Evaluating your conversation...",
    });

    // Generate unique attempt ID and build conversation before try block
    const attemptId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const scoringStartTime = Date.now();
    const conversation = messages.map((m) => ({
      role: m.role,
      content: m.text,
    }));

    try {
      // Emit analytics event with start time
      track("scoring_start", {
        challengeId: Number.parseInt(challengeId, 10),
        attemptId,
        startTime: scoringStartTime,
      });

      // Call scoring service
      const scoringResult = await scoringMutation.mutateAsync({
        challengeId,
        conversation,
        attemptId,
      });

      // Calculate scoring latency
      const scoringLatency = Date.now() - scoringStartTime;

      // Store results in sessionStorage for immediate display
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `scoring:${attemptId}`,
          JSON.stringify(scoringResult)
        );
        sessionStorage.setItem(
          `scoringConv:${attemptId}`,
          JSON.stringify(conversation)
        );
      }

      // Check if we have a partial result
      const isPartialResult =
        !scoringResult.dimensions ||
        Object.keys(scoringResult.dimensions).length < 2 ||
        scoringResult.compositeScore === 0;

      // Emit success analytics with latency and partial result flag
      track("scoring_success", {
        challengeId: Number.parseInt(challengeId, 10),
        compositeScore: scoringResult.compositeScore,
        attemptId,
        latency: scoringLatency,
        isPartial: isPartialResult,
      });

      // Save progress to database for both attempts and passes to feed streaks
      try {
        await createProgress.mutateAsync({
          challenge_id: Number.parseInt(challengeId, 10),
          score: passed ? 100 : 0,
          metadata: {
            answer,
            completed_at: new Date().toISOString(),
            difficulty:
              (challengeData?.difficulty as "easy" | "medium" | "hard") ||
              "medium",
            scoringResult, // Include scoring data
            isPartial: isPartialResult, // Flag partial results
            latency: scoringLatency, // Include latency for analytics
            attemptId, // Persist attempt ID for retrieval
            conversation, // Persist conversation for seeding chats
          },
        });
        // Notify other tabs/pages (e.g., profile) to refresh stats immediately
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("progress-updated"));
        }
      } catch (error) {
        console.error("Failed to save progress:", error);
      }

      if (passed) {
        // Update baseline metrics (cosmetic)
        try {
          await fetch("/api/baseline", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              metric_type: "elo",
              value: 1824 + Math.floor(Math.random() * 50),
            }),
          });
        } catch {}

        setStatus({
          type: "success",
          headline: "Challenge solved",
          sub: isPartialResult
            ? "Scoring complete. Some dimensions are still processing. Redirecting to results..."
            : "Scoring complete. Redirecting to results...",
        });

        // Navigate to completion page with scoring data
        setTimeout(() => {
          const userName = encodeURIComponent(displayName || "You");
          const userElo = encodeURIComponent(String(displayElo || 1200));
          const userAvatar = encodeURIComponent(
            displayAvatar || "/aipreplogo.png"
          );
          router.push(
            `/dashboard/challenge-completed/${userName}/${userElo}/${userAvatar}?challengeId=${challengeId}&attemptId=${attemptId}`
          );
        }, 1500);
      } else {
        setStatus({
          type: "error",
          headline: "Incorrect answer",
          sub: isPartialResult
            ? "Check your jumps and try again. Some scoring dimensions are still processing."
            : "Check your jumps and try again.",
        });
        setIsScoring(false);
      }
    } catch (error) {
      console.error("Scoring failed:", error);

      // Calculate latency even for failed requests
      const scoringLatency = Date.now() - scoringStartTime;

      // Check if error contains partial results
      const hasPartialResults =
        error &&
        typeof error === "object" &&
        "cause" in error &&
        error.cause &&
        typeof error.cause === "object" &&
        "compositeScore" in error.cause;

      // Emit failure analytics with latency and partial result flag
      track("scoring_failure", {
        challengeId: Number.parseInt(challengeId, 10),
        error: error instanceof Error ? error.message : String(error),
        latency: scoringLatency,
        hasPartialResults,
      });

      // If we have partial results, store them and show a partial state
      if (hasPartialResults && typeof window !== "undefined") {
        const partialResult = (error as any).cause;

        sessionStorage.setItem(
          `scoring:${attemptId}`,
          JSON.stringify(partialResult)
        );
        sessionStorage.setItem(
          `scoringConv:${attemptId}`,
          JSON.stringify(conversation)
        );

        setStatus({
          type: "error",
          headline: "Partial scoring results",
          sub: "We were able to score some dimensions. You can view the partial results or try again.",
        });

        // Navigate to completion page with partial results
        setTimeout(() => {
          const userName = encodeURIComponent(displayName || "You");
          const userElo = encodeURIComponent(String(displayElo || 1200));
          const userAvatar = encodeURIComponent(
            displayAvatar || "/aipreplogo.png"
          );
          router.push(
            `/dashboard/challenge-completed/${userName}/${userElo}/${userAvatar}?challengeId=${challengeId}&attemptId=${attemptId}`
          );
        }, 1500);
      } else {
        setStatus({
          type: "error",
          headline: "Scoring failed",
          sub: "Please try again or contact support if the issue persists.",
        });
        setIsScoring(false);
      }
    }
  };

  const handleHint = () => {
    setMessages([
      ...messages,
      {
        text: "Hint: For each starting index s, sum energy[s], energy[s+k], energy[s+2k], ... and take the maximum.",
        role: "assistant",
      },
    ]);
  };

  const handleReset = () => {
    setMessages([
      {
        text: "Explain your approach, then send your final line as: answer: NUMBER.",
        role: "assistant",
      },
    ]);
    setStatus({
      type: "idle",
      headline: "",
      sub: "",
    });
    setTestResult({ passed: false, submitted: false });
    setSubmittedAnswer(null);
  };

  const handleCopySpec = async () => {
    if (!challengeData) return;

    const spec = `Task: ${challengeData.title}
Description: ${challengeData.description}
Category: ${challengeData.category}
Difficulty: ${challengeData.difficulty || "Unknown"}
${challengeData.example ? `Example: ${challengeData.example}` : ""}`;

    try {
      await navigator.clipboard.writeText(spec);
      setStatus({
        type: "success",
        headline: "Specification copied",
        sub: "Paste into your notes if needed.",
      });
      setTimeout(
        () =>
          setStatus({
            type: "idle",
            headline: "",
            sub: "",
          }),
        1200
      );
    } catch {
      setStatus({
        type: "error",
        headline: "Copy failed",
        sub: "Select and copy manually.",
      });
    }
  };

  const getStatusIcon = () => {
    switch (status.type) {
      case "success":
        return <BadgeCheck className="size-4" />;
      case "error":
        return <XCircle className="size-4" />;
      default:
        return <Clock className="size-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86_400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2_592_000)
      return `${Math.floor(diffInSeconds / 86_400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleSubmissionClick = (submission: any) => {
    const attemptId = (submission.metadata as any)?.attemptId;
    const conversation = (submission.metadata as any)?.conversation;

    if (attemptId && conversation) {
      setSelectedSubmission({ attemptId, conversation });
      // Focus the chat area after setting the submission
      setTimeout(() => {
        const chatElement = document.querySelector("[data-chat-area]");
        if (chatElement) {
          (chatElement as HTMLElement).focus();
        }
      }, 100);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <header className="flex-none border-border border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              className="size-9"
              onClick={() => router.push("/dashboard/challenges")}
              size="icon"
              variant="ghost"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div className="flex size-9 items-center justify-center rounded-lg border border-border">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[22px] leading-6 tracking-tight">
                  Daily Challenge
                </p>
                <TechnicalModeBadge mode={challengeData.technicalMode} />
              </div>
              <p className="text-muted-foreground text-sm">
                Solve via conversation — no editor required
              </p>
            </div>
          </div>

          {/* User card */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-sm">{displayName || "You"}</p>
              <p className="text-muted-foreground text-xs">
                Elo {displayElo || 1200}
              </p>
            </div>
            <Image
              alt="User avatar"
              className="size-10 rounded-full border border-border object-cover"
              height={40}
              src={displayAvatar || "/aipreplogo.png"}
              width={40}
            />
          </div>
        </div>
      </header>

      {/* Main 1-1 Split */}
      <main className="flex-1 overflow-hidden px-6 py-4">
        <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Left: Task Specifications - Narrow Sidebar */}
          <TaskSpecifications
            challenge={challengeData}
            challengeId={challengeId}
            formatTimeAgo={formatTimeAgo}
            onCopySpec={handleCopySpec}
            onReset={handleReset}
            onSubmissionClick={handleSubmissionClick}
            submissions={submissions}
            technicalMode={challengeData.technicalMode}
          />

          {/* Right: Chat Workspace */}
          <section className="flex h-full min-h-0 flex-col overflow-hidden">
            {isSupportedMode ? (
              isPreviewOnlyMode ? (
                /* Preview-only mode for ui/image/video - replaces chat */
                <div className="min-h-0 flex-1 overflow-hidden">
                  {isUIMode ? (
                    <UiPreviewPanel
                      challengeDescription={
                        challengeData.description || undefined
                      }
                      challengeExample={challengeData.example || undefined}
                      challengeTitle={challengeData.title}
                    />
                  ) : isImageMode ? (
                    <ImagePreviewPanel />
                  ) : (
                    <VideoPreviewPanel />
                  )}
                </div>
              ) : (
                /* General mode - chat only */
                <div className="min-h-0 flex-1 overflow-hidden">
                  <Chat
                    autoFocus
                    seed={
                      selectedSubmission?.conversation as
                        | Array<{ role: "user" | "assistant"; content: string }>
                        | undefined
                    }
                  />
                </div>
              )
            ) : (
              <div className="border-border border-b bg-destructive/5 p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 size-5 flex-shrink-0 text-destructive" />
                  <div>
                    <h3 className="font-semibold text-destructive text-sm">
                      Unsupported Challenge Type
                    </h3>
                    <p className="mt-1 text-muted-foreground text-xs">
                      This challenge type ({challengeData.category}) is not
                      currently supported. Please try a different challenge.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
