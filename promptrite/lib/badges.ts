export type ThresholdBadgeId =
  | "solve-1"
  | "solve-5"
  | "solve-10"
  | "solve-25"
  | "solve-50"
  | "solve-100";

export type DifficultyBadgeId = "first-easy" | "first-medium" | "first-hard";

export type BadgeId = ThresholdBadgeId | DifficultyBadgeId;

export interface BadgeDef {
  id: BadgeId;
  label: string;
  description: string;
  // For threshold badges
  threshold?: number;
  // For difficulty-first badges
  difficulty?: "easy" | "medium" | "hard";
}

export const BADGES: BadgeDef[] = [
  { id: "solve-1", label: "First Solve", description: "Complete 1 challenge", threshold: 1 },
  { id: "solve-5", label: "Rising Coder", description: "Complete 5 challenges", threshold: 5 },
  { id: "solve-10", label: "Pro Coder", description: "Complete 10 challenges", threshold: 10 },
  { id: "solve-25", label: "Expert Coder", description: "Complete 25 challenges", threshold: 25 },
  { id: "solve-50", label: "Elite Coder", description: "Complete 50 challenges", threshold: 50 },
  { id: "solve-100", label: "Legendary Coder", description: "Complete 100 challenges", threshold: 100 },
  { id: "first-easy", label: "First Easy", description: "Solve your first Easy challenge", difficulty: "easy" },
  { id: "first-medium", label: "First Medium", description: "Solve your first Medium challenge", difficulty: "medium" },
  { id: "first-hard", label: "First Hard", description: "Solve your first Hard challenge", difficulty: "hard" },
];

export interface ComputeBadgesInput {
  totalSolved: number;
  solvedDifficulties: Set<string>; // e.g., new Set(["easy","hard"]) from user's solved challenges
}

export interface ComputedBadge {
  id: BadgeId;
  label: string;
  description: string;
  earned: boolean;
  progress?: {
    current: number;
    required: number;
  };
}

export function computeBadges(input: ComputeBadgesInput): ComputedBadge[] {
  return BADGES.map((b) => {
    if (b.threshold != null) {
      const earned = input.totalSolved >= b.threshold;
      return {
        id: b.id,
        label: b.label,
        description: b.description,
        earned,
        progress: { current: input.totalSolved, required: b.threshold },
      };
    }
    if (b.difficulty) {
      const earned = input.solvedDifficulties.has(b.difficulty);
      return { id: b.id, label: b.label, description: b.description, earned };
    }
    return { id: b.id, label: b.label, description: b.description, earned: false };
  });
}


