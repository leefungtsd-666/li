import { useCallback, useState } from 'react';
import type { WritingStats } from './writingProjectTypes.ts';
import { WRITING_STATS_KEY } from './projectConstants.ts';

function loadStats(): WritingStats {
  try {
    const raw = localStorage.getItem(WRITING_STATS_KEY);
    if (!raw) return { dailyStats: {}, currentSessionWords: 0 };
    return JSON.parse(raw) as WritingStats;
  } catch {
    return { dailyStats: {}, currentSessionWords: 0 };
  }
}

function saveStats(stats: WritingStats): void {
  try {
    localStorage.setItem(WRITING_STATS_KEY, JSON.stringify(stats));
  } catch {
    // silently ignore
  }
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useWritingStats() {
  const [stats, setStats] = useState<WritingStats>(loadStats);

  /**
   * Record words written in the current session.
   * This adds to the daily count and updates the session counter.
   */
  const recordWords = useCallback((wordCount: number) => {
    setStats((prev) => {
      const today = getTodayKey();
      const prevDaily = prev.dailyStats[today] ?? 0;
      // Only add if the count increased (new words written)
      const newWords = wordCount > prev.currentSessionWords
        ? wordCount - prev.currentSessionWords
        : 0;

      if (newWords === 0 && prev.currentSessionWords === wordCount) return prev;

      const next: WritingStats = {
        dailyStats: {
          ...prev.dailyStats,
          [today]: prevDaily + newWords,
        },
        currentSessionWords: wordCount,
      };
      saveStats(next);
      return next;
    });
  }, []);

  const resetSession = useCallback(() => {
    setStats((prev) => {
      const next = { ...prev, currentSessionWords: 0 };
      saveStats(next);
      return next;
    });
  }, []);

  const getTodayWords = useCallback((): number => {
    return stats.dailyStats[getTodayKey()] ?? 0;
  }, [stats.dailyStats]);

  const getWeekWords = useCallback((): number => {
    const today = new Date();
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      total += stats.dailyStats[key] ?? 0;
    }
    return total;
  }, [stats.dailyStats]);

  return { stats, recordWords, resetSession, getTodayWords, getWeekWords };
}
