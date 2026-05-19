import { useCallback, useState } from 'react';

export interface RecentFileEntry {
  filePath: string;
  fileName: string;
  lastOpenedAt: number;
}

const STORAGE_KEY = 'li-recent-files';
const MAX_ENTRIES = 10;

function loadRecentFiles(): RecentFileEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentFileEntry[];
  } catch {
    return [];
  }
}

function saveRecentFiles(files: RecentFileEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch {
    // localStorage full - silently ignore
  }
}

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentFileEntry[]>(loadRecentFiles);

  const addRecentFile = useCallback((filePath: string, fileName: string) => {
    setRecentFiles((prev) => {
      const filtered = prev.filter((f) => f.filePath !== filePath);
      const entry: RecentFileEntry = {
        filePath,
        fileName,
        lastOpenedAt: Date.now(),
      };
      const next = [entry, ...filtered].slice(0, MAX_ENTRIES);
      saveRecentFiles(next);
      return next;
    });
  }, []);

  const removeRecentFile = useCallback((filePath: string) => {
    setRecentFiles((prev) => {
      const next = prev.filter((f) => f.filePath !== filePath);
      saveRecentFiles(next);
      return next;
    });
  }, []);

  const clearRecentFiles = useCallback(() => {
    setRecentFiles([]);
    saveRecentFiles([]);
  }, []);

  return { recentFiles, addRecentFile, removeRecentFile, clearRecentFiles };
}
