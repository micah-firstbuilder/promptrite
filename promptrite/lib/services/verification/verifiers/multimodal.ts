import type { IVerifier, VerifierContext, VerifierResult } from "../registry";

export const multimodalVerifier: IVerifier = {
  type: "multimodal",
  async verify(context: VerifierContext): Promise<VerifierResult> {
    const checks: Array<{ name: string; passed: boolean; message?: string }> =
      [];

    // Check 1: Output is not empty
    const hasContent = context.output.trim().length > 0;
    checks.push({
      name: "has_content",
      passed: hasContent,
      message: hasContent
        ? "Output contains data"
        : "Output is empty or only whitespace",
    });

    // Check 2: Has valid image/video markers or metadata (URLs, base64, or file paths)
    const hasMediaMarker = hasMediaContent(context.output);
    checks.push({
      name: "has_media_marker",
      passed: hasMediaMarker,
      message: hasMediaMarker
        ? "Output contains media references or metadata"
        : "Output lacks recognizable media content",
    });

    // Check 3: Minimum length
    const minLength = context.output.trim().length >= 20;
    checks.push({
      name: "minimum_length",
      passed: minLength,
      message: minLength
        ? `Content is sufficient (${context.output.length} chars)`
        : "Content too short",
    });

    // Check 4: Goal alignment (heuristic)
    let goalScore = 0;
    if (context.challengeGoals && context.challengeGoals.length > 0) {
      goalScore = calculateGoalAlignment(
        context.output,
        context.challengeGoals
      );
    }
    const meetsGoals = goalScore >= 40; // Lower threshold for multimodal
    checks.push({
      name: "meets_goals",
      passed: meetsGoals,
      message: `Goal alignment: ${goalScore}%`,
    });

    // Check 5: Valid structure (if JSON, it should parse; if text, should have description)
    const hasValidStructure = checkValidStructure(context.output);
    checks.push({
      name: "valid_structure",
      passed: hasValidStructure,
      message: hasValidStructure
        ? "Output has valid structure"
        : "Output structure is invalid",
    });

    // Calculate final score
    const passedCount = checks.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    return {
      type: "multimodal",
      score,
      details: {
        checks,
        metadata: {
          hasMediaMarker,
          contentLength: context.output.length,
          goalScore,
        },
      },
    };
  },
};

/**
 * Check if output contains media references (URLs, base64, file paths, etc.)
 */
function hasMediaContent(output: string): boolean {
  const patterns = [
    /https?:\/\/[^\s]+/,
    /data:image\/\w+;base64/,
    /data:video\/\w+;base64/,
    /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|avi)\b/i,
    /"url"\s*:\s*["']/,
    /"src"\s*:\s*["']/,
    /"data"\s*:\s*["']/,
    /\/images\//,
    /\/videos\//,
  ];

  return patterns.some((pattern) => pattern.test(output));
}

/**
 * Check if output has valid structure (JSON, descriptive text, etc.)
 */
function checkValidStructure(output: string): boolean {
  const trimmed = output.trim();

  // Try JSON
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  // Otherwise, treat as valid if it has at least some text
  return trimmed.length >= 20;
}

/**
 * Heuristic goal alignment check.
 */
function calculateGoalAlignment(
  output: string,
  goals: Array<{ title: string; criteria: string }>
): number {
  if (goals.length === 0) return 100;

  const lowerOutput = output.toLowerCase();
  const matches = goals.reduce((acc, goal) => {
    const criteria = goal.criteria.toLowerCase();
    const keywords = criteria.split(/\W+/).filter((w) => w.length > 2);

    const keywordMatches = keywords.filter((kw) =>
      lowerOutput.includes(kw)
    ).length;
    return acc + (keywordMatches > 0 ? 1 : 0);
  }, 0);

  return Math.round((matches / goals.length) * 100);
}
