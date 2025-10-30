import type { IVerifier, VerifierContext, VerifierResult } from "../registry";

export const codeVerifier: IVerifier = {
  type: "code",
  async verify(context: VerifierContext): Promise<VerifierResult> {
    const checks: Array<{ name: string; passed: boolean; message?: string }> =
      [];

    // Check 1: Output is not empty
    const hasContent = context.output.trim().length > 0;
    checks.push({
      name: "has_content",
      passed: hasContent,
      message: hasContent
        ? "Output contains code"
        : "Output is empty or only whitespace",
    });

    // Check 2: Check for balanced brackets/braces
    const balancedBrackets = checkBalancedBrackets(context.output);
    checks.push({
      name: "balanced_syntax",
      passed: balancedBrackets,
      message: balancedBrackets
        ? "Brackets and braces are balanced"
        : "Unbalanced brackets or braces detected",
    });

    // Check 3: Check for basic code structure (function, class, or meaningful statements)
    const hasCodeStructure = hasValidCodeStructure(context.output);
    checks.push({
      name: "code_structure",
      passed: hasCodeStructure,
      message: hasCodeStructure
        ? "Output has recognizable code structure"
        : "Output lacks proper code structure",
    });

    // Check 4: Check if output meets goals (heuristic matching)
    let goalMetScore = 0;
    if (context.challengeGoals && context.challengeGoals.length > 0) {
      goalMetScore = calculateGoalAlignment(
        context.output,
        context.challengeGoals
      );
    }
    const meetsGoals = goalMetScore >= 50;
    checks.push({
      name: "meets_goals",
      passed: meetsGoals,
      message: `Goal alignment score: ${goalMetScore}%`,
    });

    // Check 5: Check minimum code length (at least 20 characters, excluding whitespace)
    const significantLength = context.output.replace(/\s/g, "").length >= 20;
    checks.push({
      name: "minimum_length",
      passed: significantLength,
      message: significantLength
        ? "Code is substantial enough"
        : "Code is too short",
    });

    // Calculate final score based on checks
    const passedCount = checks.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    return {
      type: "code",
      score,
      details: {
        checks,
        metadata: {
          contentLength: context.output.length,
          significantLength: context.output.replace(/\s/g, "").length,
          goalMetScore,
        },
      },
    };
  },
};

/**
 * Check if brackets and braces are balanced.
 */
function checkBalancedBrackets(code: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    "{": "}",
    "[": "]",
    "(": ")",
  };

  for (const char of code) {
    if (char in pairs) {
      stack.push(char);
    } else if (Object.values(pairs).includes(char)) {
      const top = stack.pop();
      if (!top || pairs[top] !== char) {
        return false;
      }
    }
  }

  return stack.length === 0;
}

/**
 * Check if code has recognizable structure (functions, classes, loops, conditionals).
 */
function hasValidCodeStructure(code: string): boolean {
  const patterns = [
    /function\s+\w+\s*\(/,
    /\w+\s*\([^)]*\)\s*{/,
    /class\s+\w+/,
    /for\s*\(/,
    /while\s*\(/,
    /if\s*\(/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /var\s+\w+\s*=/,
    /def\s+\w+\s*\(/,
    /class\s+\w+:/,
    /def\s+\w+\s*\(/,
  ];

  return patterns.some((pattern) => pattern.test(code));
}

/**
 * Heuristic scoring of goal alignment based on keyword matching.
 */
function calculateGoalAlignment(
  code: string,
  goals: Array<{ title: string; criteria: string }>
): number {
  if (goals.length === 0) return 100;

  const lowerCode = code.toLowerCase();
  const matches = goals.reduce((acc, goal) => {
    const criteria = goal.criteria.toLowerCase();
    const keywords = criteria
      .split(/\W+/)
      .filter((w) => w.length > 3 && !["that", "this", "with"].includes(w));

    const keywordMatches = keywords.filter((kw) =>
      lowerCode.includes(kw)
    ).length;
    return acc + (keywordMatches > 0 ? 1 : 0);
  }, 0);

  return Math.round((matches / goals.length) * 100);
}
