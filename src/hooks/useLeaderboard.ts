import { useState, useCallback, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { LeaderboardEntry } from '../types';

const MAX_ENTRIES = 10;
const MAX_NAME_LENGTH = 20;
const MAX_REASONABLE_SCORE = 176; // Total number of memes in the game

const leaderboardCollection = collection(db, 'leaderboard');

function sanitizeName(name: string): string {
  return name
    .trim()
    .slice(0, MAX_NAME_LENGTH)
    .replace(/[<>]/g, ''); // Basic XSS prevention
}

function isValidScore(score: number): boolean {
  return (
    typeof score === 'number' &&
    Number.isInteger(score) &&
    score >= 0 &&
    score <= MAX_REASONABLE_SCORE
  );
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [lastAddedEntry, setLastAddedEntry] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to real-time leaderboard updates
  useEffect(() => {
    const q = query(
      leaderboardCollection,
      orderBy('score', 'desc'),
      orderBy('timestamp', 'asc'),
      limit(MAX_ENTRIES)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const leaderboardEntries: LeaderboardEntry[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            playerName: data.playerName,
            score: data.score,
            timestamp: data.timestamp instanceof Timestamp
              ? data.timestamp.toMillis()
              : Date.now(),
          };
        });
        setEntries(leaderboardEntries);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching leaderboard:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addEntry = useCallback(
    async (playerName: string, score: number): Promise<LeaderboardEntry | null> => {
      // Validate inputs
      if (!isValidScore(score)) {
        console.warn('Invalid score rejected:', score);
        return null;
      }

      const sanitizedName = sanitizeName(playerName);
      if (!sanitizedName) {
        return null;
      }

      try {
        const docRef = await addDoc(leaderboardCollection, {
          playerName: sanitizedName,
          score,
          timestamp: serverTimestamp(),
        });

        const newEntry: LeaderboardEntry = {
          id: docRef.id,
          playerName: sanitizedName,
          score,
          timestamp: Date.now(),
        };

        setLastAddedEntry(newEntry);
        return newEntry;
      } catch (error) {
        console.error('Error adding leaderboard entry:', error);
        return null;
      }
    },
    []
  );

  const getPlayerRank = useCallback(
    (entryId: string): number | null => {
      const index = entries.findIndex((e) => e.id === entryId);
      return index >= 0 ? index + 1 : null;
    },
    [entries]
  );

  const isScoreWorthy = useCallback(
    (score: number): boolean => {
      if (score <= 0) return false;
      if (entries.length < MAX_ENTRIES) return true;
      const lowestScore = entries[entries.length - 1]?.score ?? 0;
      return score > lowestScore;
    },
    [entries]
  );

  return {
    entries,
    lastAddedEntry,
    addEntry,
    getPlayerRank,
    isScoreWorthy,
    isLoading,
  };
}
