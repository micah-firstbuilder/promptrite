"use client";

import { Percent, Signal } from "lucide-react";
import { CategoryBadge } from "./category-badge";

type Category = "design" | "code" | "image" | "video";
type ChallengeType = "one-shot" | "multi-turn";

interface ChallengeCardProps {
  id: string; // Added id prop for routing
  title: string;
  subtitle: string;
  category: Category;
  type: ChallengeType;
  difficulty: string;
  completion: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ChallengeCard({
  id, // Destructure id
  title,
  subtitle,
  category,
  type,
  difficulty,
  completion,
  isSelected,
  onClick,
}: ChallengeCardProps) {
  const getTypeStyles = () =>
    type === "multi-turn"
      ? "bg-blue-500/10 text-blue-700 ring-blue-500/20"
      : "bg-amber-500/10 text-amber-700 ring-amber-500/20";

  const prettyType = () => (type === "multi-turn" ? "Multi‑turn" : "One‑shot");

  return (
    <button
      type="button"
      aria-label={`Open details for ${title}`}
      className={`group relative block w-full overflow-hidden rounded-lg bg-card text-left ring-1 ring-border ring-inset transition hover:ring-muted-foreground/30 ${
        isSelected ? "outline outline-primary/60" : ""
      }`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={category} />
          <span
            className={`rounded-md px-2 py-1 font-medium text-xs ring-1 ring-inset ${getTypeStyles()}`}
          >
            {prettyType()}
          </span>
        </div>
        <h3 className="mt-3 font-semibold text-foreground text-lg tracking-tight">
          {title}
        </h3>
        <p className="mt-1 text-muted-foreground text-sm">{subtitle}</p>
        <div className="mt-3 flex items-center justify-between text-muted-foreground text-xs">
          <span className="inline-flex items-center gap-1">
            <Percent className="size-3.5" /> {completion}% passed
          </span>
          <span className="inline-flex items-center gap-1">
            <Signal className="size-3.5" /> {difficulty}
          </span>
        </div>
      </div>
    </button>
  );
}
