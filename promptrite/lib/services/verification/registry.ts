/**
 * Verifier types: define what kind of verification to run for a submission.
 */
export type VerifierType = "code" | "text" | "multimodal";

/**
 * Map challenge categories to verifier types.
 * Categories from challenges.category field.
 */
const CATEGORY_TO_VERIFIER: Record<string, VerifierType> = {
  code: "code",
  python: "code",
  javascript: "code",
  typescript: "code",
  java: "code",
  go: "code",
  rust: "code",
  cpp: "code",
  csharp: "code",
  ruby: "code",
  sql: "code",
  image: "multimodal",
  video: "multimodal",
  design: "multimodal",
  text: "text",
  writing: "text",
  creative: "text",
  default: "text",
};

/**
 * Route a challenge category to a verifier type.
 * Defaults to 'text' if category is unknown.
 */
export function routeVerifierByCategory(category: string): VerifierType {
  const normalized = category.toLowerCase().trim();
  return CATEGORY_TO_VERIFIER[normalized] || CATEGORY_TO_VERIFIER.default;
}

/**
 * Interface for verifier results.
 */
export interface VerifierResult {
  type: VerifierType;
  score: number; // 0-100
  details: {
    checks: Array<{
      name: string;
      passed: boolean;
      message?: string;
    }>;
    metadata?: Record<string, unknown>;
  };
}

/**
 * Verifier interface - all verifiers must implement this.
 */
export interface IVerifier {
  type: VerifierType;
  verify(context: VerifierContext): Promise<VerifierResult>;
}

/**
 * Context passed to verifiers.
 */
export interface VerifierContext {
  challengeTitle: string;
  challengeDescription: string;
  challengeGoals?: Array<{ title: string; criteria: string }>;
  output: string;
  submissionType?: string;
}
