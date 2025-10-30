"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/app/utils/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DEFAULT_TEST_PAYLOAD = {
  challengeId: "1",
  conversation: [
    {
      role: "user" as const,
      content:
        "I need to write a function that calculates the Fibonacci sequence. Can you help me understand the algorithm first?",
    },
    {
      role: "assistant" as const,
      content:
        "Sure! The Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones. It starts with 0 and 1. The sequence goes: 0, 1, 1, 2, 3, 5, 8, 13, 21, etc. There are two main approaches: recursive and iterative. The recursive approach is elegant but inefficient for large numbers due to repeated calculations. The iterative approach is more efficient.",
    },
    {
      role: "user" as const,
      content:
        "That makes sense. Can you show me how to implement the iterative approach in TypeScript?",
    },
    {
      role: "assistant" as const,
      content:
        "Absolutely! Here's an efficient iterative implementation:\n\nfunction fibonacci(n: number): number {\n  if (n <= 1) return n;\n  let prev = 0, curr = 1;\n  for (let i = 2; i <= n; i++) {\n    const next = prev + curr;\n    prev = curr;\n    curr = next;\n  }\n  return curr;\n}\n\nThis function runs in O(n) time with O(1) space, making it very efficient even for large values of n.",
    },
  ],
};

interface ScoringResponse {
  compositeScore: number;
  dimensions?: Record<string, number>;
  explanations?: Record<string, string>;
  perGoal?: Array<{
    goalId: string;
    title: string;
    score: number;
    met?: boolean;
    explanation?: string;
  }>;
  goalAlignment?: number;
  conversationMetrics?: {
    messageCount: number;
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    averageMessageLength: number;
  };
}

export default function ScoringTestPage() {
  const [result, setResult] = useState<ScoringResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  useEffect(() => {
    // expose logs to window for quick inspection in dev
    (window as any).__scoringTestLogs = debugLogs;
  }, [debugLogs]);

  const scoringMutation = trpc.scoring.scoreConversationTest.useMutation({
    onMutate: (vars) => {
      setDebugLogs((d) => [...d, `mutate (test) -> ${JSON.stringify(vars)}`]);
    },
    onSuccess: (data) => {
      setResult(data as ScoringResponse);
      setError(null);
      setIsLoading(false);
      setDebugLogs((d) => [...d, `success (test) -> ${JSON.stringify(data)}`]);
    },
    onError: (err) => {
      // Safely extract message from possible shapes returned by TRPC
      const maybeData = (err as any).data;
      const errorMsgFromData =
        maybeData && typeof maybeData.message === "string"
          ? maybeData.message
          : null;
      const errorMsg = errorMsgFromData ?? err.message ?? String(err);
      setError(errorMsg);
      setResult(null);
      setIsLoading(false);
      setDebugLogs((d) => [...d, `error -> ${errorMsg}`]);
    },
  });

  const handleSubmit = () => {
    console.log("[scoring-test] handleSubmit called");
    setDebugLogs((d) => [...d, "[client] handleSubmit called"]);
    setIsLoading(true);
    setError(null);
    setResult(null);
    // prefer mutateAsync so we can await and catch unexpected errors
    scoringMutation.mutate(DEFAULT_TEST_PAYLOAD);
  };

  // Render page even if Clerk isn't configured so we don't hang during dev.

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Scoring API Test
          </h1>
          <p className="mt-2 text-muted-foreground">
            Test the conversation scoring endpoint with a default payload
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Payload</CardTitle>
            <CardDescription>
              Default test conversation about Fibonacci sequence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-4 text-sm">
              {JSON.stringify(DEFAULT_TEST_PAYLOAD, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <div>
          <Button
            className="w-full"
            disabled={isLoading || (scoringMutation as any).isLoading}
            onClick={handleSubmit}
            size="lg"
            type="button"
          >
            {isLoading || (scoringMutation as any).isLoading
              ? "Scoring..."
              : "Submit for Scoring"}
          </Button>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Composite Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-4xl text-blue-600">
                  {result.compositeScore}/100
                </div>
                {typeof result.goalAlignment === "number" && (
                  <div className="mt-2 text-muted-foreground text-sm">
                    Goal alignment: {Math.round(result.goalAlignment)}/100
                  </div>
                )}
              </CardContent>
            </Card>

            {result.perGoal && result.perGoal.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Per-goal Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.perGoal.map((g) => (
                      <div className="rounded border p-3" key={g.goalId}>
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{g.title}</p>
                          <p className="font-semibold text-xl">{g.score}</p>
                        </div>
                        {typeof g.met === "boolean" && (
                          <p className="mt-1 text-muted-foreground text-xs">
                            Met: {g.met ? "Yes" : "No"}
                          </p>
                        )}
                        {g.explanation && (
                          <p className="mt-1 text-sm">{g.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.dimensions && Object.keys(result.dimensions).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Dimension Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(result.dimensions).map(([key, value]) => (
                      <div className="rounded border p-3" key={key}>
                        <p className="font-medium text-muted-foreground text-sm capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <p className="font-bold text-2xl">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.explanations &&
              Object.keys(result.explanations).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Explanations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(result.explanations).map(
                        ([key, value]) => (
                          <div key={key}>
                            <p className="font-medium text-muted-foreground text-sm capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </p>
                            <p className="mt-1 text-sm">{value}</p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {result.conversationMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Message Count</p>
                      <p className="font-semibold">
                        {result.conversationMetrics.messageCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Tokens</p>
                      <p className="font-semibold">
                        {result.conversationMetrics.totalTokens}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Input Tokens</p>
                      <p className="font-semibold">
                        {result.conversationMetrics.inputTokens}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Output Tokens</p>
                      <p className="font-semibold">
                        {result.conversationMetrics.outputTokens}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">
                        Avg Message Length
                      </p>
                      <p className="font-semibold">
                        {result.conversationMetrics.averageMessageLength}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Full Response</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-4 text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
            <CardDescription>Mutation lifecycle logs (dev)</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-4 text-sm">
              {debugLogs.join("\n")}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
