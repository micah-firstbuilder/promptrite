"use client";

import {
  AlertTriangle,
  Clock,
  FileText,
  Gauge,
  MessageSquare,
  RefreshCw,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import React from "react"; // Added missing import for React
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ScoringResponse } from "@/lib/services/gateway";

interface ScoreSummaryProps {
  result: ScoringResponse;
  title?: string;
  improvement?: number;
  className?: string;
  onRetry?: () => void;
  onStatus?: () => void;
  onViewElo?: () => void;
}

interface LoadingStateProps {
  className?: string;
}

interface ErrorStateProps {
  className?: string;
  onRetry?: () => void;
  onStatus?: () => void;
}

interface PartialStateProps {
  result: Partial<ScoringResponse>;
  className?: string;
}

// Circular gauge component for composite score
function CircularGauge({
  value,
  size = 96,
  isPartial = false,
}: {
  value: number;
  size?: number;
  isPartial?: boolean;
}) {
  const percentage = Math.max(0, Math.min(100, value));
  const degrees = (percentage / 100) * 360;

  // Color based on score
  const getColor = (score: number) => {
    if (score >= 80) return "#22c55e"; // emerald
    if (score >= 60) return "#3b82f6"; // blue
    if (score >= 40) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const color = getColor(percentage);

  return (
    <div
      aria-label={`Overall score ${value} out of 100${isPartial ? " (partial)" : ""}`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={value}
      className="relative shrink-0"
      role="progressbar"
      style={{
        width: size,
        height: size,
        minWidth: size, // Ensure minimum size on small screens
        minHeight: size, // Ensure minimum height on small screens
      }}
    >
      <div
        className="h-full w-full rounded-full"
        style={{
          background: `conic-gradient(${color} ${degrees}deg, #e5e7eb ${degrees}deg)`,
        }}
      />
      <div className="absolute inset-1 rounded-full border border-slate-200 bg-white" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-semibold text-2xl tracking-tight">
          {Math.round(value)}
        </div>
        <div className="text-[10px] text-slate-500">
          {isPartial ? "Partial" : "/100"}
        </div>
      </div>
    </div>
  );
}

// Dimension item component
function DimensionItem({
  name,
  value,
  explanation,
  icon: Icon,
  color = "sky",
  isPending = false,
}: {
  name: string;
  value?: number;
  explanation?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: "sky" | "violet" | "emerald" | "amber" | "slate";
  isPending?: boolean;
}) {
  const colorClasses = {
    sky: "bg-sky-50 ring-sky-200 text-sky-600",
    violet: "bg-violet-50 ring-violet-200 text-violet-600",
    emerald: "bg-emerald-50 ring-emerald-200 text-emerald-600",
    amber: "bg-amber-50 ring-amber-200 text-amber-600",
    slate: "bg-slate-100 ring-slate-200 text-slate-500",
  };

  const progressColorClasses = {
    sky: "bg-sky-200 [&_[data-slot=progress-indicator]]:bg-sky-500",
    violet: "bg-violet-200 [&_[data-slot=progress-indicator]]:bg-violet-500",
    emerald: "bg-emerald-200 [&_[data-slot=progress-indicator]]:bg-emerald-500",
    amber: "bg-amber-200 [&_[data-slot=progress-indicator]]:bg-amber-500",
    slate: "bg-slate-200 [&_[data-slot=progress-indicator]]:bg-slate-300",
  };

  const textColorClasses = {
    sky: "text-sky-700",
    violet: "text-violet-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    slate: "text-slate-700",
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ${colorClasses[color]}`}
          >
            <Icon aria-hidden="true" className="size-4" />
          </span>
          <span className="font-medium text-slate-800 text-sm">{name}</span>
        </div>
        {isPending ? (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 text-xs ring-1 ring-slate-200">
            Score pending
          </span>
        ) : (
          <span
            aria-label={`${name} score: ${value} out of 100`}
            className={`font-medium text-sm ${textColorClasses[color]}`}
          >
            {value}
          </span>
        )}
      </div>
      <div
        aria-label={`${name} score${isPending ? " pending" : ""}`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={isPending ? 0 : value || 0}
        aria-valuetext={
          isPending
            ? "Score is pending calculation"
            : `${name} score is ${value} out of 100`
        }
        className={`h-2 w-full overflow-hidden rounded-full ring-1 ring-black/5 ${progressColorClasses[color]}`}
        role="progressbar"
      >
        <Progress className="h-full" value={isPending ? 0 : value || 0} />
      </div>
      {explanation && (
        <p
          className="mt-2 text-slate-600 text-xs"
          id={`${name.toLowerCase().replace(/\s+/g, "-")}-explanation`}
        >
          {explanation}
        </p>
      )}
    </article>
  );
}

// Loading state component
function LoadingState({ className }: LoadingStateProps) {
  return (
    <div className={className}>
      <section
        aria-busy={true}
        aria-label="Score Summary – Loading"
        className="space-y-4"
      >
        {/* Composite score skeleton */}
        <Card className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-slate-200" />
                <div className="h-3 w-56 rounded bg-slate-200" />
                <div className="flex gap-2 pt-2">
                  <div className="h-5 w-16 rounded bg-slate-200" />
                  <div className="h-5 w-16 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dimensions skeleton */}
        <Card className="animate-pulse">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="h-4 w-44 rounded bg-slate-200" />
              <div className="h-16 w-full rounded bg-slate-200" />
              <div className="h-16 w-full rounded bg-slate-200" />
              <div className="h-16 w-full rounded bg-slate-200" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// Error state component
function ErrorState({ className, onRetry, onStatus }: ErrorStateProps) {
  return (
    <div className={className}>
      <section
        aria-label="Score Summary – Error"
        aria-live="polite"
        className="space-y-3"
      >
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200">
                <AlertTriangle
                  aria-hidden="true"
                  className="size-4 text-amber-600"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm tracking-tight">
                  We couldn't load your scores
                </h4>
                <p className="mt-1 text-slate-600 text-xs">
                  Network hiccup or the scoring service is temporarily
                  unavailable.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {onRetry && (
                    <Button
                      aria-label="Retry scoring your submission"
                      className="bg-slate-900 text-white hover:bg-slate-800"
                      onClick={onRetry}
                      size="sm"
                    >
                      <RefreshCw aria-hidden="true" className="mr-1 size-3" />
                      Retry
                    </Button>
                  )}
                  {onStatus && (
                    <Button
                      aria-label="Check system status"
                      onClick={onStatus}
                      size="sm"
                      variant="outline"
                    >
                      <Settings aria-hidden="true" className="mr-1 size-3" />
                      Status
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// Partial state component
function PartialState({ result, className }: PartialStateProps) {
  const compositeScore = result.compositeScore || 0;
  const dimensions = result.dimensions || {};
  const explanations = result.explanations || {};

  return (
    <div className={className}>
      <section
        aria-label="Score Summary – Partial"
        aria-live="polite"
        className="space-y-4"
      >
        {/* Composite score */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <CircularGauge
                isPartial={true}
                size={80}
                value={compositeScore}
              />
              <div className="flex-1">
                <h3 className="font-medium text-base tracking-tight">
                  Performance Summary
                </h3>
                <p className="mt-1 text-slate-600 text-xs">
                  Scoring in progress. Some dimensions are still pending.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dimensions */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Show available dimensions */}
              {Object.entries(dimensions).map(([key, value]) => {
                if (typeof value !== "number") return null;

                const dimensionConfig = {
                  clarity: {
                    name: "Clarity",
                    icon: MessageSquare,
                    color: "sky" as const,
                  },
                  outputQuality: {
                    name: "Output Quality",
                    icon: Sparkles,
                    color: "violet" as const,
                  },
                  messageCount: {
                    name: "Message Count",
                    icon: Target,
                    color: "emerald" as const,
                  },
                  characterLength: {
                    name: "Character Length",
                    icon: FileText,
                    color: "amber" as const,
                  },
                };

                const config =
                  dimensionConfig[key as keyof typeof dimensionConfig];
                if (!config) return null;

                const explanation =
                  explanations[key as keyof typeof explanations];

                return (
                  <DimensionItem
                    color={config.color}
                    explanation={explanation}
                    icon={config.icon}
                    key={key}
                    name={config.name}
                    value={value}
                  />
                );
              })}

              {/* Show pending dimensions */}
              {(["clarity", "outputQuality"] as const).map((key) => {
                if (dimensions[key]) return null; // Already shown above

                const pendingConfig = {
                  clarity: {
                    name: "Clarity",
                    icon: Clock,
                    color: "slate" as const,
                  },
                  outputQuality: {
                    name: "Output Quality",
                    icon: Clock,
                    color: "slate" as const,
                  },
                };

                const config = pendingConfig[key];
                if (!config) return null;

                return (
                  <DimensionItem
                    color={config.color}
                    explanation="We're still computing this dimension."
                    icon={config.icon}
                    isPending={true}
                    key={key}
                    name={config.name}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// Main ScoreSummary component
export function ScoreSummary({
  result,
  title = "Score Summary",
  improvement,
  className,
  onRetry,
  onStatus,
  onViewElo,
}: ScoreSummaryProps) {
  const compositeScore = result.compositeScore;
  const dimensions = result.dimensions || {};
  const explanations = result.explanations || {};
  const perGoal = result.perGoal || [];

  // Determine if this is a partial result
  const isPartial = Object.keys(dimensions).length < 2 || compositeScore === 0;

  // Get encouraging message based on score
  const getEncouragingMessage = (score: number) => {
    if (score >= 90) return "Outstanding work! You've mastered this challenge.";
    if (score >= 80)
      return "Strong showing. Keep refining structure and consistency to push into the 90s.";
    if (score >= 70)
      return "Good progress. Focus on clarity and completeness to improve further.";
    if (score >= 60) return "Solid attempt. Review the feedback and try again.";
    return "Keep practicing. Each attempt helps you improve.";
  };

  const encouragingMessage = getEncouragingMessage(compositeScore);

  // Get percentile estimate
  const getPercentile = (score: number) => {
    if (score >= 90) return "Top 5%";
    if (score >= 80) return "Top 20%";
    if (score >= 70) return "Top 40%";
    if (score >= 60) return "Top 60%";
    return "Top 80%";
  };

  // Set up a ref for the score summary container
  const scoreSummaryRef = React.useRef<HTMLDivElement>(null);

  // Focus the score summary when it first renders
  React.useEffect(() => {
    if (scoreSummaryRef.current) {
      scoreSummaryRef.current.focus();
    }
  }, []);

  return (
    <div
      aria-label="Score Summary"
      className={className}
      ref={scoreSummaryRef}
      tabIndex={-1}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-slate-200 border-b bg-white/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge aria-hidden="true" className="size-5 text-violet-600" />
            <h1 className="font-semibold text-lg tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {onViewElo && (
              <Button
                aria-label="View your new Elo"
                className="bg-slate-900 text-white hover:bg-slate-800"
                onClick={onViewElo}
                size="sm"
                variant="outline"
              >
                View your new Elo
              </Button>
            )}
            <Badge
              className="bg-emerald-50 text-emerald-600 ring-emerald-200"
              variant="secondary"
            >
              Latest
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4 md:p-6">
        {/* Composite Score */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <CircularGauge value={compositeScore} />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h2 className="font-medium text-base tracking-tight md:text-lg">
                    Your Overall Score
                  </h2>
                  {compositeScore >= 80 && (
                    <TrendingUp
                      aria-hidden="true"
                      className="size-4 text-emerald-600"
                    />
                  )}
                </div>
                <p className="mt-1 text-slate-600 text-xs">
                  {encouragingMessage}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {improvement && improvement > 0 && (
                    <Badge
                      className="bg-emerald-50 text-emerald-700 ring-emerald-200"
                      variant="secondary"
                    >
                      Improved +{improvement}
                    </Badge>
                  )}
                  <Badge
                    className="bg-blue-50 text-blue-700 ring-blue-200"
                    variant="secondary"
                  >
                    {getPercentile(compositeScore)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dimension Breakdown */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock aria-hidden="true" className="size-4 text-violet-600" />
              <h3 className="font-medium text-lg tracking-tight">
                Dimension Breakdown
              </h3>
            </div>
            <div className="space-y-3">
              {/* Clarity */}
              {dimensions.clarity !== undefined && (
                <DimensionItem
                  color="sky"
                  explanation={explanations.clarity}
                  icon={MessageSquare}
                  name="Clarity"
                  value={dimensions.clarity}
                />
              )}

              {/* Output Quality */}
              {dimensions.outputQuality !== undefined && (
                <DimensionItem
                  color="violet"
                  explanation={explanations.outputQuality}
                  icon={Sparkles}
                  name="Output Quality"
                  value={dimensions.outputQuality}
                />
              )}

              {/* Message Count (informational) */}
              {dimensions.messageCount !== undefined && (
                <DimensionItem
                  color="emerald"
                  explanation={
                    explanations.messageCount ||
                    "Number of messages in conversation"
                  }
                  icon={Target}
                  name="Message Count"
                  value={dimensions.messageCount}
                />
              )}

              {/* Character Length (informational) */}
              {dimensions.characterLength !== undefined && (
                <DimensionItem
                  color="amber"
                  explanation={
                    explanations.characterLength || "Total character count"
                  }
                  icon={FileText}
                  name="Character Length"
                  value={dimensions.characterLength}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Per-goal results */}
        {perGoal.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Target aria-hidden="true" className="size-4 text-violet-600" />
                <h3 className="font-medium text-lg tracking-tight">
                  Goal Results
                </h3>
              </div>
              <div className="space-y-3">
                {perGoal.map((goal) => (
                  <div
                    className="rounded-lg border border-slate-200 bg-white p-3"
                    key={goal.goalId}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 ring-1 ring-violet-200">
                          <Target
                            aria-hidden="true"
                            className="size-4 text-violet-600"
                          />
                        </span>
                        <span className="font-medium text-slate-800 text-sm">
                          {goal.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-violet-700">
                          {goal.score}
                        </span>
                        {goal.met !== undefined && (
                          <Badge
                            className={
                              goal.met
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : "bg-red-50 text-red-700 ring-red-200"
                            }
                            variant="secondary"
                          >
                            {goal.met ? "Met" : "Not Met"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {goal.explanation && (
                      <p className="mt-2 text-slate-600 text-xs">
                        {goal.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accessibility note */}
        <div className="pt-1 text-[11px] text-slate-500">
          Tip: Each score has ARIA labels and values for assistive tech; focus
          styles are provided for interactive elements.
        </div>
      </div>
    </div>
  );
}

// Export loading and error states for external use
export { LoadingState, ErrorState, PartialState };
