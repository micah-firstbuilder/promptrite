export interface ChallengeGoal {
  id: string; // stable identifier for aggregation
  title: string; // short name of the goal
  criteria: string; // plain-language acceptance criteria
  weight?: number; // default 1
  critical?: boolean; // if true and under threshold, cap composite
}

export interface ChallengeContext {
  id: number;
  title: string;
  description: string;
  goals: ChallengeGoal[]; // normalized at call site
  difficulty?: string;
  category?: string;
}
