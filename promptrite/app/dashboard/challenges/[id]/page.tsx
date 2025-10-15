"use client";

import {
  ArrowLeft,
  BadgeCheck,
  Bot,
  Check,
  CheckCircle,
  Clipboard,
  Clock,
  Lightbulb,
  ListChecks,
  Monitor,
  Send,
  Sparkles,
  Undo,
  User,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import DiscussionSection from "@/components/DiscussionSection";

// Mock challenge data - in a real app, this would come from an API
const challengeData: Record<string, any> = {
  "1": {
    title: "Max Energy Path with K-Jumps",
    category: "Code",
    type: "Multi‑turn",
    tags: ["Algorithm", "Arrays", "Dynamic Traversal"],
    description:
      "You are given an integer array energy and an integer k. Choose a starting index i, then repeatedly jump by k steps: i, i+k, i+2k, ... until the index exceeds the array bounds. The score is the sum of visited values. Return the maximum possible score over all valid starting positions.",
    requirements: [
      "Explain your approach briefly in chat.",
      "Provide the final numeric answer for Case 1 in the format: answer: NUMBER",
      "Then press Submit to validate.",
    ],
    visibleCase: {
      energy: [5, 2, -10, -5, 1],
      k: 3,
      description: "Expected to return the best achievable score.",
    },
    hiddenCase: {
      description: "Evaluated after you pass Case 1.",
    },
    examples: [
      {
        title: "Example A",
        content:
          "energy = [4, -1, 7, 3], k = 2 → Try starts at indices 0..3 and pick the max sum along jumps of length 2.",
      },
    ],
    expectedAnswer: 3,
    outputType: "code",
  },
};

type Message = {
  text: string;
  role: "user" | "assistant";
};

type StatusType = "idle" | "success" | "error";

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.id as string;
  const challenge = challengeData[challengeId];

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
    headline: "Awaiting submission",
    sub: "Solve Case 1, then submit.",
  });
  const [testResult, setTestResult] = useState<{
    passed: boolean;
    submitted: boolean;
  }>({
    passed: false,
    submitted: false,
  });
  const [submittedAnswer, setSubmittedAnswer] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!challenge) {
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

    const passed = answer === challenge.expectedAnswer;
    setSubmittedAnswer(answer);
    setTestResult({ passed, submitted: true });

    if (passed) {
      // Save progress to database
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            challenge_id: challengeId,
            score: 100, // Points for completing the challenge
            metadata: {
              answer,
              completed_at: new Date().toISOString(),
              difficulty: challenge.difficulty,
            },
          }),
        });

        // Update baseline metrics
        await fetch("/api/baseline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            metric_type: "elo",
            value: 1824 + Math.floor(Math.random() * 50), // Simulate ELO increase
          }),
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }

      setStatus({
        type: "success",
        headline: "Challenge solved",
        sub: "Visible case passed. Hidden case evaluated server‑side.",
      });
      setTimeout(() => {
        const userName = encodeURIComponent("Alex Rivera");
        const userElo = encodeURIComponent("1824");
        const userAvatar = encodeURIComponent("https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=120&auto=format&fit=crop");
        router.push(
          `/dashboard/challenge-completed/${userName}/${userElo}/${userAvatar}`
        );
      }, 1500);
    } else {
      setStatus({
        type: "error",
        headline: "Incorrect answer",
        sub: "Check your jumps and try again.",
      });
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
      headline: "Awaiting submission",
      sub: "Solve Case 1, then submit.",
    });
    setTestResult({ passed: false, submitted: false });
    setSubmittedAnswer(null);
  };

  const handleCopySpec = async () => {
    const spec = `Task: ${challenge.title}
Array: [${challenge.visibleCase.energy.join(", ")}], k=${challenge.visibleCase.k}
Category: ${challenge.category}
Return the maximum sum over sequences i, i+k, i+2k, ... within bounds. Provide final line: "answer: NUMBER".`;

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
            headline: "Awaiting submission",
            sub: "Solve Case 1, then submit.",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
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
              <p className="font-semibold text-[22px] leading-6 tracking-tight">
                Daily Challenge
              </p>
              <p className="text-muted-foreground text-sm">
                Solve via conversation — no editor required
              </p>
            </div>
          </div>

          {/* User card */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-sm">Alex Rivera</p>
              <p className="text-muted-foreground text-xs">Elo 1824</p>
            </div>
            <Image
              alt="User avatar"
              className="size-10 rounded-full border border-border object-cover"
              height={40}
              src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=120&auto=format&fit=crop"
              width={40}
            />
          </div>
        </div>
      </header>

      {/* Main 1-1 Split */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Task Specifications */}
          <section className="flex flex-col overflow-hidden rounded-xl border border-border">
            {/* Title */}
            <div className="border-border border-b bg-card px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-semibold text-[24px] tracking-tight sm:text-[26px]">
                    {challenge.title}
                  </h1>
                  <div className="mt-1 flex items-center gap-3 text-xs">
                    <span className="rounded-full border border-border bg-muted px-2.5 py-1">
                      {challenge.category}
                    </span>
                    {challenge.tags.map((tag: string) => (
                      <span
                        className="rounded-full border border-border px-2.5 py-1"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Mode</p>
                  <p className="font-medium text-sm">{challenge.type}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
              <div>
                <h2 className="font-semibold text-[20px] tracking-tight">
                  Description
                </h2>
                <p className="mt-2 text-[15px] text-muted-foreground leading-6">
                  {challenge.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[18px] tracking-tight">
                  Requirements
                </h3>
                <ul className="mt-3 space-y-2">
                  {challenge.requirements.map((req: string, idx: number) => (
                    <li className="flex items-start gap-3" key={idx}>
                      <Check className="mt-0.5 size-4" />
                      <span className="text-[15px]">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <p className="font-medium text-sm">Case 1 (visible)</p>
                  <div className="mt-2 text-sm">
                    <p>energy = [{challenge.visibleCase.energy.join(", ")}]</p>
                    <p>k = {challenge.visibleCase.k}</p>
                  </div>
                  <p className="mt-3 text-muted-foreground text-sm">
                    {challenge.visibleCase.description}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="font-medium text-sm">Case 2 (hidden)</p>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {challenge.hiddenCase.description}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[18px] tracking-tight">
                  Examples
                </h3>
                {challenge.examples.map((example: any, idx: number) => (
                  <div
                    className="mt-3 rounded-lg border border-border"
                    key={idx}
                  >
                    <div className="border-border border-b px-4 py-3 font-medium text-sm">
                      {example.title}
                    </div>
                    <div className="px-4 py-3 text-sm">{example.content}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <Button onClick={handleCopySpec} size="sm" variant="outline">
                    <Clipboard className="size-4" /> Copy spec
                  </Button>
                  <Button onClick={handleReset} size="sm" variant="outline">
                    <Undo className="size-4" /> Reset chat
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Right: Chat + Validation */}
          <section className="flex flex-col overflow-hidden rounded-xl border border-border">
            {/* Status banner */}
            <div className="border-border border-b bg-card px-5 py-3 sm:px-6">
              <div className="flex items-center gap-2 text-sm">
                {getStatusIcon()}
                <span className="font-medium">{status.headline}</span>
                <span className="text-muted-foreground">{status.sub}</span>
              </div>
            </div>

            {/* Chat area */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
                {messages.map((msg, idx) => (
                  <div className="flex items-start gap-3" key={idx}>
                    <div className="flex size-8 items-center justify-center rounded-lg border border-border">
                      {msg.role === "user" ? (
                        <User className="size-4" />
                      ) : (
                        <Bot className="size-4" />
                      )}
                    </div>
                    <div className="max-w-[85%]">
                      <div className="rounded-xl border border-border bg-card px-4 py-3">
                        <p className="text-[15px]">{msg.text}</p>
                      </div>
                      <p className="mt-1 text-muted-foreground text-xs">
                        {msg.role === "user" ? "You" : "Assistant"}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div className="border-border border-t p-3 sm:p-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="sr-only" htmlFor="composer">
                      Message
                    </label>
                    <div className="rounded-xl border border-border bg-card px-4 py-3">
                      <textarea
                        className="w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
                        id="composer"
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Type your reasoning... end with: answer: 3"
                        rows={2}
                        value={input}
                      />
                    </div>
                  </div>
                  <Button className="shrink-0" onClick={handleSend}>
                    <Send className="size-4" />
                    <span className="font-medium text-sm">Send</span>
                  </Button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-muted-foreground text-xs">
                    Shift+Enter for newline
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleSubmit} size="sm" variant="outline">
                      <CheckCircle className="size-4" /> Submit
                    </Button>
                    <Button onClick={handleHint} size="sm" variant="outline">
                      <Lightbulb className="size-4" /> Hint
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Test results */}
            <div className="border-border border-t bg-card px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListChecks className="size-4" />
                  <p className="font-medium text-sm">Test Result</p>
                </div>
                <div
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    testResult.passed
                      ? "border-green-500/20 bg-green-500/10 text-green-700"
                      : "border-border"
                  }`}
                >
                  {testResult.passed ? "1" : "0"}/1 passed
                </div>
              </div>
              <div className="mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-24 text-muted-foreground">Case 1</span>
                  <span
                    className={`rounded-md border px-2.5 py-1 ${
                      testResult.submitted
                        ? testResult.passed
                          ? "border-green-500/20 bg-green-500/10 text-green-700"
                          : "border-red-500/20 bg-red-500/10 text-red-700"
                        : "border-border"
                    }`}
                  >
                    {testResult.submitted
                      ? testResult.passed
                        ? "Passed"
                        : "Failed"
                      : "Waiting"}
                  </span>
                </div>
              </div>

              {/* Submission Output */}
              <div className="mt-4 border-border border-t pt-4">
                <div className="flex items-center gap-2">
                  <Monitor className="size-4" />
                  <p className="font-medium text-sm">Submission Output</p>
                  <span className="ml-2 rounded-full border border-border bg-muted px-2 py-0.5 text-xs">
                    Auto
                  </span>
                </div>

                <div className="mt-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">App Preview</p>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs ${
                          testResult.submitted
                            ? testResult.passed
                              ? "border-green-500/20 bg-green-500/10 text-green-700"
                              : "border-amber-500/20 bg-amber-500/10 text-amber-700"
                            : "border-border"
                        }`}
                      >
                        {testResult.submitted
                          ? testResult.passed
                            ? "Success"
                            : "Check"
                          : "Idle"}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-[22px] tracking-tight">
                          {submittedAnswer !== null ? submittedAnswer : "—"}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          Computed answer
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Peer Examples */}
        <DiscussionSection challengeId={challengeId} />
      </main>
    </div>
  );
}
