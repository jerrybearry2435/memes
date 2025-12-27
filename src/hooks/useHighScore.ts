import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'meme-higher-lower-highscore';

export function useHighScore() {
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, highScore.toString());
    } catch {
      // localStorage might not be available
    }
  }, [highScore]);

  const updateHighScore = useCallback((score: number): boolean => {
    if (score > highScore) {
      setHighScore(score);
      return true;
    }
    return false;
  }, [highScore]);

  const resetHighScore = useCallback(() => {
    setHighScore(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage might not be available
    }
  }, []);

  return { highScore, updateHighScore, resetHighScore };
}
