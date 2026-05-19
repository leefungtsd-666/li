import { useCallback, useState } from 'react';
import type { RecentProjectEntry } from './writingProjectTypes.ts';
import { RECENT_PROJECTS_KEY, MAX_RECENT_PROJECTS } from './projectConstants.ts';

function loadRecentProjects(): RecentProjectEntry[] {
  try {
    const raw = localStorage.getItem(RECENT_PROJECTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentProjectEntry[];
  } catch {
    return [];
  }
}

function saveRecentProjects(projects: RecentProjectEntry[]): void {
  try {
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    // localStorage full - silently ignore
  }
}

export function useRecentProjects() {
  const [recentProjects, setRecentProjects] = useState<RecentProjectEntry[]>(loadRecentProjects);

  const addRecentProject = useCallback((projectDir: string, title: string) => {
    setRecentProjects((prev) => {
      const filtered = prev.filter((p) => p.projectDir !== projectDir);
      const entry: RecentProjectEntry = {
        projectDir,
        title,
        lastOpenedAt: Date.now(),
      };
      const next = [entry, ...filtered].slice(0, MAX_RECENT_PROJECTS);
      saveRecentProjects(next);
      return next;
    });
  }, []);

  const removeRecentProject = useCallback((projectDir: string) => {
    setRecentProjects((prev) => {
      const next = prev.filter((p) => p.projectDir !== projectDir);
      saveRecentProjects(next);
      return next;
    });
  }, []);

  const clearRecentProjects = useCallback(() => {
    setRecentProjects([]);
    saveRecentProjects([]);
  }, []);

  return { recentProjects, addRecentProject, removeRecentProject, clearRecentProjects };
}
