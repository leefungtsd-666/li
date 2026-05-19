import { useCallback, useState } from 'react';
import type { WordCountTarget } from './writingProjectTypes.ts';
import { DEFAULT_WORD_COUNT_TARGET } from './writingProjectTypes.ts';

const STORAGE_KEY = 'li-wordcount-target';

function loadTarget(): WordCountTarget {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WORD_COUNT_TARGET;
    return JSON.parse(raw) as WordCountTarget;
  } catch {
    return DEFAULT_WORD_COUNT_TARGET;
  }
}

function saveTarget(target: WordCountTarget): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
  } catch {
    // silently ignore
  }
}

export function useWordCountTargets() {
  const [target, setTargetState] = useState<WordCountTarget>(loadTarget);

  const setTarget = useCallback((newTarget: WordCountTarget) => {
    setTargetState(newTarget);
    saveTarget(newTarget);
  }, []);

  const updateDaily = useCallback(
    (daily: number) => {
      const next = { ...target, daily };
      setTargetState(next);
      saveTarget(next);
    },
    [target],
  );

  const updateWeekly = useCallback(
    (weekly: number) => {
      const next = { ...target, weekly };
      setTargetState(next);
      saveTarget(next);
    },
    [target],
  );

  const updateProject = useCallback(
    (project: number) => {
      const next = { ...target, project };
      setTargetState(next);
      saveTarget(next);
    },
    [target],
  );

  return { target, setTarget, updateDaily, updateWeekly, updateProject };
}
