import { createHash } from "node:crypto";
import { google } from "@ai-sdk/google";
import { cosineSimilarity, embed, embedMany } from "ai";

interface CacheEntry {
  embedding: number[];
  timestamp: number;
}

// In-memory cache with TTL (5 minutes)
const embeddingCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000;

function getCacheKey(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of embeddingCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      embeddingCache.delete(key);
    }
  }
}

/**
 * Embed a single string value using Google's text embedding model.
 * Results are cached by SHA256 hash of content.
 */
export async function embedValue(
  value: string,
  options?: {
    model?: string;
    maxRetries?: number;
  }
): Promise<{
  embedding: number[];
  usage: { tokens: number };
  cached: boolean;
}> {
  const cacheKey = getCacheKey(value);

  // Check cache
  const cached = embeddingCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      embedding: cached.embedding,
      usage: { tokens: 0 }, // cached, no tokens charged
      cached: true,
    };
  }

  cleanExpiredCache();

  try {
    const result = await embed({
      model: google.textEmbedding(options?.model || "text-embedding-004"),
      value,
      maxRetries: options?.maxRetries ?? 2,
      abortSignal: AbortSignal.timeout(4000),
    });

    // Store in cache
    embeddingCache.set(cacheKey, {
      embedding: result.embedding,
      timestamp: Date.now(),
    });

    return {
      embedding: result.embedding,
      usage: result.usage,
      cached: false,
    };
  } catch (error) {
    throw new Error(
      `Failed to embed value: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Embed multiple values in parallel using Google's text embedding model.
 * Results are cached by SHA256 hash of content.
 */
export async function embedValues(
  values: string[],
  options?: {
    model?: string;
    maxRetries?: number;
    maxParallelCalls?: number;
  }
): Promise<{
  embeddings: number[][];
  usage: { tokens: number };
  cached: number;
}> {
  const results: number[][] = [];
  let totalTokens = 0;
  let cachedCount = 0;
  const uncachedValues: Array<{ index: number; value: string }> = [];

  cleanExpiredCache();

  // Check cache for all values
  for (const [index, value] of values.entries()) {
    const cacheKey = getCacheKey(value);
    const cached = embeddingCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      results[index] = cached.embedding;
      cachedCount++;
    } else {
      uncachedValues.push({ index, value });
    }
  }

  // Embed uncached values
  if (uncachedValues.length > 0) {
    try {
      const embeddingResult = await embedMany({
        model: google.textEmbedding(options?.model || "text-embedding-004"),
        values: uncachedValues.map((v) => v.value),
        maxRetries: options?.maxRetries ?? 2,
        maxParallelCalls: options?.maxParallelCalls ?? 2,
        abortSignal: AbortSignal.timeout(4000),
      });

      totalTokens = embeddingResult.usage.tokens ?? 0;

      // Store in cache and assign to results
      for (const [i, embedding] of embeddingResult.embeddings.entries()) {
        const originalIndex = uncachedValues[i].index;
        const value = uncachedValues[i].value;
        results[originalIndex] = embedding;

        embeddingCache.set(getCacheKey(value), {
          embedding,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      throw new Error(
        `Failed to embed multiple values: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return {
    embeddings: results,
    usage: { tokens: totalTokens },
    cached: cachedCount,
  };
}

/**
 * Calculate cosine similarity between two values by embedding both and computing distance.
 */
export async function calculateSimilarity(
  text1: string,
  text2: string,
  options?: {
    model?: string;
  }
): Promise<{
  similarity: number; // 0-1
  usage: { tokens: number };
}> {
  const results = await embedValues([text1, text2], {
    model: options?.model || "text-embedding-004",
    maxParallelCalls: 2,
  });

  const [embedding1, embedding2] = results.embeddings;

  if (!(embedding1 && embedding2)) {
    throw new Error("Failed to compute embeddings for similarity calculation");
  }

  const similarity = cosineSimilarity(embedding1, embedding2);

  return {
    similarity: Math.max(0, Math.min(1, similarity)), // Clamp to [0, 1]
    usage: results.usage,
  };
}

/**
 * Summarize challenge context into a single string for embedding.
 */
export function summarizeChallengeContext(challenge: {
  title: string;
  description: string;
  goals?: Array<{ title: string; criteria: string }>;
}): string {
  const parts = [challenge.title, challenge.description];

  if (challenge.goals && challenge.goals.length > 0) {
    const goalsText = challenge.goals
      .map((g) => `${g.title}: ${g.criteria}`)
      .join(" | ");
    parts.push(goalsText);
  }

  return parts.join("\n\n");
}

/**
 * Clear the embedding cache (useful for testing or memory management).
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
}

/**
 * Get current cache stats for debugging/monitoring.
 */
export function getEmbeddingCacheStats(): {
  size: number;
  maxSize: number;
} {
  cleanExpiredCache();
  return {
    size: embeddingCache.size,
    maxSize: -1, // Unbounded
  };
}
