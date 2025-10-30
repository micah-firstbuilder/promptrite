"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
  label: string;
  description: string;
  earned: boolean;
  progress?: { current: number; required: number };
}

export function BadgeCard({
  label,
  description,
  earned,
  progress,
}: BadgeCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border",
        earned ? "bg-card" : "bg-muted/40"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium text-foreground">{label}</div>
            <div className="text-muted-foreground text-sm">{description}</div>
          </div>
          <span
            aria-label={earned ? "Badge earned" : "Badge locked"}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs ring-1",
              earned
                ? "bg-primary/10 text-primary ring-primary/20"
                : "bg-muted text-muted-foreground ring-border"
            )}
          >
            {earned ? "✓" : "🔒"}
          </span>
        </div>
        {progress && (
          <div className="mt-3">
            <Progress
              aria-label={`${label} progress`}
              value={Math.min(
                100,
                Math.round((progress.current / progress.required) * 100)
              )}
            />
            <div className="mt-1 text-muted-foreground text-xs">
              {progress.current}/{progress.required}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
