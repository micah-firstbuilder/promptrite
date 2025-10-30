/**
 * Simple token estimation utility
 * Uses a rough approximation: ~4 characters per token (very conservative)
 * For production, consider using a proper tokenizer library
 */

/**
 * Estimates token count for a single text string
 * @param text - The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) return 0;
  // Rough approximation: ~4 characters per token
  // This is conservative and works for English text
  return Math.ceil(text.length / 4);
}

/**
 * Sums token estimates across multiple messages
 * @param messages - Array of message strings
 * @returns Total estimated token count
 */
export function sumTokens(messages: string[]): number {
  if (!messages || messages.length === 0) return 0;
  return messages.reduce((total, msg) => total + estimateTokens(msg), 0);
}
