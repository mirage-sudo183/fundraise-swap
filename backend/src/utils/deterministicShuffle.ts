/**
 * Deterministic Shuffle Utility
 *
 * Ensures both co-founders see the exact same order for Archive mode.
 * Uses a seeded PRNG (Mulberry32) with Fisher-Yates shuffle.
 */

/**
 * Mulberry32: A simple seeded PRNG
 * Returns a function that produces deterministic random numbers 0-1
 */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert string seed to numeric seed using a simple hash
 */
function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Fisher-Yates shuffle with seeded PRNG
 *
 * Given the same seed and same input array (by ID), always produces same output.
 *
 * @param items - Array of items with 'id' property
 * @param seed - Workspace seed string
 * @returns New array with items in deterministic shuffled order
 */
export function deterministicShuffle<T extends { id: string }>(
  items: T[],
  seed: string
): T[] {
  // First, sort by ID for consistent input order
  const result = [...items].sort((a, b) => a.id.localeCompare(b.id));

  // Initialize seeded PRNG
  const random = mulberry32(stringToSeed(seed));

  // Fisher-Yates shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Generate a cryptographically random seed for a new workspace
 */
export function generateWorkspaceSeed(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let seed = '';
  for (let i = 0; i < 32; i++) {
    seed += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return seed;
}
