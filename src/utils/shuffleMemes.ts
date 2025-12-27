import type { Meme } from '../types';

/**
 * Fisher-Yates shuffle algorithm for randomizing meme order
 */
export function shuffleMemes(memes: Meme[]): Meme[] {
  const shuffled = [...memes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get a random meme from the array that hasn't been used yet
 */
export function getRandomMeme(memes: Meme[], usedIds: Set<string>): Meme | null {
  const available = memes.filter(meme => !usedIds.has(meme.id));
  if (available.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Get a pair of random memes for comparison
 */
export function getRandomMemePair(memes: Meme[], usedIds: Set<string>): [Meme, Meme] | null {
  const available = memes.filter(meme => !usedIds.has(meme.id));

  if (available.length < 2) {
    // Not enough unused memes, reset the pool
    const shuffled = shuffleMemes(memes);
    return [shuffled[0], shuffled[1]];
  }

  const shuffled = shuffleMemes(available);
  return [shuffled[0], shuffled[1]];
}
