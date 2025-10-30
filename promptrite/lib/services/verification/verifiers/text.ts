import type { IVerifier, VerifierContext, VerifierResult } from "../registry";

export const textVerifier: IVerifier = {
  type: "text",
  async verify(context: VerifierContext): Promise<VerifierResult> {
    const checks: Array<{ name: string; passed: boolean; message?: string }> =
      [];

    // Check 1: Output is not empty
    const hasContent = context.output.trim().length > 0;
    checks.push({
      name: "has_content",
      passed: hasContent,
      message: hasContent
        ? "Output contains text"
        : "Output is empty or only whitespace",
    });

    // Check 2: Minimum length (at least 50 characters)
    const minLength = context.output.trim().length >= 50;
    checks.push({
      name: "minimum_length",
      passed: minLength,
      message: minLength
        ? `Text is substantial (${context.output.trim().length} chars)`
        : `Text too short (${context.output.trim().length} chars, need 50+)`,
    });

    // Check 3: Contains complete sentences (heuristic)
    const hasSentences = context.output.split(/[.!?]+/).length >= 2;
    checks.push({
      name: "has_sentences",
      passed: hasSentences,
      message: hasSentences
        ? "Text contains complete sentences"
        : "Text lacks clear sentence structure",
    });

    // Check 4: Goal alignment
    let goalScore = 0;
    if (context.challengeGoals && context.challengeGoals.length > 0) {
      goalScore = calculateGoalAlignment(
        context.output,
        context.challengeGoals
      );
    }
    const meetsGoals = goalScore >= 50;
    checks.push({
      name: "meets_goals",
      passed: meetsGoals,
      message: `Goal alignment: ${goalScore}%`,
    });

    // Check 5: Basic quality (check for minimum word count and vocabulary variety)
    const wordCount = context.output.trim().split(/\s+/).length;
    const uniqueWords = new Set(
      context.output
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 0)
    ).size;
    const vocabularyScore = uniqueWords >= Math.min(wordCount / 2, 50);
    checks.push({
      name: "vocabulary_variety",
      passed: vocabularyScore,
      message: `${wordCount} words, ${uniqueWords} unique`,
    });

    // Calculate final score
    const passedCount = checks.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    return {
      type: "text",
      score,
      details: {
        checks,
        metadata: {
          wordCount,
          charCount: context.output.length,
          goalScore,
          uniqueWords,
        },
      },
    };
  },
};

/**
 * Heuristic scoring based on keyword matching from goal criteria.
 */
function calculateGoalAlignment(
  text: string,
  goals: Array<{ title: string; criteria: string }>
): number {
  if (goals.length === 0) return 100;

  const lowerText = text.toLowerCase();
  const matches = goals.reduce((acc, goal) => {
    const criteria = goal.criteria.toLowerCase();
    const keywords = criteria
      .split(/\W+/)
      .filter((w) => w.length > 2 && !isCommonWord(w));

    const keywordMatches = keywords.filter((kw) =>
      lowerText.includes(kw)
    ).length;
    return acc + (keywordMatches > 0 ? 1 : 0);
  }, 0);

  return Math.round((matches / goals.length) * 100);
}

function isCommonWord(word: string): boolean {
  const common = new Set([
    "the",
    "and",
    "that",
    "this",
    "with",
    "from",
    "have",
    "does",
    "will",
    "your",
    "more",
    "also",
    "than",
  ]);
  return common.has(word);
}
