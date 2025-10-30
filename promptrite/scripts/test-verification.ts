#!/usr/bin/env ts-node

/**
 * Smoke test for the verification orchestration.
 * Tests verifier routing, embedding similarity, LLM judging, and composite scoring.
 * Run with: npx ts-node scripts/test-verification.ts
 */

import {
  clearEmbeddingCache,
  getEmbeddingCacheStats,
} from "@/lib/services/embeddings";
import { runVerification } from "@/lib/services/verification";
import type { ChallengeContext } from "@/types/challenges";

// Test challenges
const testChallenges: Record<string, ChallengeContext> = {
  code: {
    id: 1,
    title: "Write a Simple Function",
    description: "Write a JavaScript function that adds two numbers",
    category: "javascript",
    difficulty: "easy",
    goals: [
      {
        id: "1",
        title: "Function Exists",
        criteria: "Function should be defined and named",
        weight: 1,
        critical: true,
      },
      {
        id: "2",
        title: "Correct Implementation",
        criteria: "Function should accept two parameters and return their sum",
        weight: 1,
        critical: true,
      },
    ],
  },
  text: {
    id: 2,
    title: "Write a Short Story",
    description: "Write a creative short story about a character's discovery",
    category: "creative",
    difficulty: "medium",
    goals: [
      {
        id: "1",
        title: "Story Structure",
        criteria: "Story should have a beginning, middle, and end",
        weight: 1,
        critical: false,
      },
      {
        id: "2",
        title: "Character Development",
        criteria: "Main character should show growth or change",
        weight: 1,
        critical: false,
      },
    ],
  },
  image: {
    id: 3,
    title: "Design a Logo",
    description: "Design a simple logo for a tech startup",
    category: "design",
    difficulty: "medium",
    goals: [
      {
        id: "1",
        title: "Visual Design",
        criteria: "Logo should be visually appealing and professional",
        weight: 1,
        critical: false,
      },
    ],
  },
};

// Test outputs
const testOutputs = {
  goodCode: `function add(a, b) {
    return a + b;
  }
  
  console.log(add(2, 3)); // Output: 5`,

  badCode: `// Not a valid function
  add = 2 3`,

  goodText: `The old lighthouse keeper discovered a bottle washed ashore. Inside was a map 
  leading to an island he never knew existed. Over the course of a week, he transformed 
  from a solitary man into an adventurer, ready to explore the unknown world that awaited him.`,

  badText: "Story",

  imageUrl: `{
    "url": "https://example.com/logo.png",
    "format": "PNG",
    "dimensions": "256x256"
  }`,
};

async function runTests() {
  console.log("🧪 Starting Verification Smoke Tests\n");

  try {
    // Test 1: Code verifier
    console.log("Test 1: Code Verifier with Good Output");
    let result = await runVerification({
      challenge: testChallenges.code,
      output: testOutputs.goodCode,
      submissionType: "code",
    });
    console.log(
      `✓ Score: ${result.composite.score}, Passed: ${result.composite.passed}`
    );
    console.log(
      `  - LLM: ${result.llm.score}, Verifier: ${result.verifier.score}, Embedding: ${result.embedding.score}\n`
    );

    // Test 2: Code verifier with bad output
    console.log("Test 2: Code Verifier with Bad Output");
    result = await runVerification({
      challenge: testChallenges.code,
      output: testOutputs.badCode,
      submissionType: "code",
    });
    console.log(
      `✓ Score: ${result.composite.score}, Passed: ${result.composite.passed}`
    );
    console.log(
      `  - LLM: ${result.llm.score}, Verifier: ${result.verifier.score}, Embedding: ${result.embedding.score}\n`
    );

    // Test 3: Text verifier with good output
    console.log("Test 3: Text Verifier with Good Output");
    result = await runVerification({
      challenge: testChallenges.text,
      output: testOutputs.goodText,
      submissionType: "text",
    });
    console.log(
      `✓ Score: ${result.composite.score}, Passed: ${result.composite.passed}`
    );
    console.log(
      `  - LLM: ${result.llm.score}, Verifier: ${result.verifier.score}, Embedding: ${result.embedding.score}\n`
    );

    // Test 4: Text verifier with bad output
    console.log("Test 4: Text Verifier with Bad Output");
    result = await runVerification({
      challenge: testChallenges.text,
      output: testOutputs.badText,
      submissionType: "text",
    });
    console.log(
      `✓ Score: ${result.composite.score}, Passed: ${result.composite.passed}`
    );
    console.log(
      `  - LLM: ${result.llm.score}, Verifier: ${result.verifier.score}, Embedding: ${result.embedding.score}\n`
    );

    // Test 5: Multimodal verifier
    console.log("Test 5: Multimodal Verifier with Image URL");
    result = await runVerification({
      challenge: testChallenges.image,
      output: testOutputs.imageUrl,
      submissionType: "image",
    });
    console.log(
      `✓ Score: ${result.composite.score}, Passed: ${result.composite.passed}`
    );
    console.log(
      `  - LLM: ${result.llm.score}, Verifier: ${result.verifier.score}, Embedding: ${result.embedding.score}\n`
    );

    // Cache stats
    const stats = getEmbeddingCacheStats();
    console.log(`📊 Embedding Cache Stats: ${stats.size} items cached`);

    console.log("\n✅ All smoke tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    clearEmbeddingCache();
  }
}

runTests();
