"use client";

import {
  Check,
  CheckCircle,
  Clipboard,
  Eye,
  History,
  Undo,
  XCircle,
} from "lucide-react";
import DiscussionSection from "@/components/DiscussionSection";
import { TechnicalModeBadge } from "@/components/technical-mode-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TechnicalMode } from "@/lib/utils/challenges";

export type Submission = {
  id: string | number;
  score: number;
  created_at: string | Date;
  metadata?: unknown;
};

type Challenge = {
  title: string;
  category: string;
  description: string;
  difficulty?: string;
  tags?: string[];
  requirements?: string[];
  visibleCase?: {
    energy: number[];
    k: number;
    description: string;
  };
  hiddenCase?: {
    description: string;
  };
};

interface TaskSpecificationsProps {
  challenge: Challenge;
  challengeId: string;
  submissions?: Submission[];
  onCopySpec: () => void;
  onReset: () => void;
  onSubmissionClick: (submission: Submission) => void;
  formatTimeAgo: (date: Date) => string;
  technicalMode?: TechnicalMode;
}

export const TaskSpecifications = ({
  challenge,
  challengeId,
  submissions,
  onCopySpec,
  onReset,
  onSubmissionClick,
  formatTimeAgo,
  technicalMode,
}: TaskSpecificationsProps) => {
  return (
    <section className="m-0 flex h-full min-h-0 flex-col overflow-hidden border-border border-r">
      {/* Title */}
      <div className="border-border border-b bg-card px-4 py-3">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-lg tracking-tight">
            {challenge.title}
          </h1>
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="rounded-full border border-border bg-muted px-2 py-0.5">
              {challenge.category}
            </span>
            {technicalMode && <TechnicalModeBadge mode={technicalMode} />}
            {challenge.tags?.slice(0, 2).map((tag: string) => (
              <span
                className="rounded-full border border-border px-2 py-0.5"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content with Tabs */}
      <div className="flex min-h-0 flex-1 flex-col">
        <Tabs
          className="flex min-h-0 flex-1 flex-col"
          defaultValue="description"
        >
          <div className="border-border border-b px-3 pt-1">
            <TabsList className="h-auto flex-wrap justify-start gap-1">
              <TabsTrigger className="px-2 py-1 text-xs" value="description">
                Description
              </TabsTrigger>
              <TabsTrigger className="px-2 py-1 text-xs" value="examples">
                Examples
              </TabsTrigger>
              <TabsTrigger className="px-2 py-1 text-xs" value="submissions">
                Submissions
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            className="flex-1 overflow-y-auto px-3 py-4"
            value="description"
          >
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-sm tracking-tight">
                  Description
                </h2>
                <p className="mt-1 text-muted-foreground text-xs leading-5">
                  {challenge.description}
                </p>
              </div>
              {challenge.requirements && challenge.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm tracking-tight">
                    Requirements
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {challenge.requirements.map((req: string, idx: number) => (
                      <li className="flex items-start gap-2 text-xs" key={idx}>
                        <Check className="mt-0.5 size-3 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {challenge.visibleCase && challenge.hiddenCase && (
                <div className="space-y-2">
                  <div className="rounded-lg border border-border p-3">
                    <p className="font-medium text-xs">Case 1 (visible)</p>
                    <div className="mt-1 space-y-1 text-xs">
                      <p className="break-words text-muted-foreground">
                        [{challenge.visibleCase.energy.join(", ")}]
                      </p>
                      <p>k = {challenge.visibleCase.k}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="font-medium text-xs">Case 2</p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {challenge.hiddenCase.description}
                    </p>
                  </div>
                </div>
              )}
              <div className="pt-2">
                <div className="flex flex-col gap-1">
                  <Button
                    className="h-8 text-xs"
                    onClick={onCopySpec}
                    size="sm"
                    variant="outline"
                  >
                    <Clipboard className="size-3" /> Copy
                  </Button>
                  <Button
                    className="h-8 text-xs"
                    onClick={onReset}
                    size="sm"
                    variant="outline"
                  >
                    <Undo className="size-3" /> Reset
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent
            className="flex-1 overflow-y-auto px-3 py-4"
            value="examples"
          >
            <div className="h-full min-h-0">
              <DiscussionSection challengeId={challengeId} />
            </div>
          </TabsContent>
          <TabsContent
            className="flex-1 overflow-y-auto px-3 py-4"
            value="submissions"
          >
            <div className="space-y-3">
              <h2 className="font-semibold text-sm tracking-tight">
                Your Submissions
              </h2>
              {!submissions || submissions.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  <History className="mx-auto mb-2 size-8 opacity-50" />
                  <p className="text-xs">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {submissions.slice(0, 20).map((submission) => {
                    const isPassed = submission.score >= 100;
                    const metadata = submission.metadata as
                      | Record<string, unknown>
                      | undefined;
                    const compositeScore = (() => {
                      if (!metadata || typeof metadata !== "object") return;
                      const scoringResult = metadata.scoringResult;
                      if (
                        scoringResult &&
                        typeof scoringResult === "object" &&
                        "compositeScore" in scoringResult
                      ) {
                        const score = (scoringResult as Record<string, unknown>)
                          .compositeScore;
                        return typeof score === "number" ? score : undefined;
                      }
                      return;
                    })();
                    const hasConversation = (() => {
                      if (!metadata || typeof metadata !== "object")
                        return false;
                      return !!(metadata.conversation && metadata.attemptId);
                    })();

                    return (
                      <button
                        aria-label={`Submission from ${formatTimeAgo(new Date(submission.created_at))}, ${isPassed ? "passed" : "failed"}`}
                        className="w-full rounded border border-border p-2 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!hasConversation}
                        key={submission.id}
                        onClick={() => onSubmissionClick(submission)}
                        type="button"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            {isPassed ? (
                              <CheckCircle className="size-4 flex-shrink-0 text-green-600" />
                            ) : (
                              <XCircle className="size-4 flex-shrink-0 text-red-600" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-xs">
                                  {isPassed ? "Passed" : "Failed"}
                                </span>
                              </div>
                              <div className="truncate text-muted-foreground text-xs">
                                {formatTimeAgo(new Date(submission.created_at))}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {compositeScore ?? "—"} / 100
                              </div>
                            </div>
                          </div>
                          {hasConversation && (
                            <Eye className="size-3 flex-shrink-0 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
