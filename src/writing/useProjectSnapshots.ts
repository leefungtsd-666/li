import { useCallback, useState } from 'react';
import { isTauri } from '../utils/platform.ts';

export interface SnapshotEntry {
  id: string;
  timestamp: string;
  label: string;
}

const SNAPSHOTS_DIR = 'snapshots';

/**
 * Hook for managing project snapshots (version history).
 * Snapshots copy the entire project directory to a timestamped subdirectory.
 */
export function useProjectSnapshots() {
  const [snapshots, setSnapshots] = useState<SnapshotEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Create a snapshot of the project directory.
   */
  const createSnapshot = useCallback(
    async (projectDir: string, label: string = ''): Promise<SnapshotEntry | null> => {
      if (!isTauri || !projectDir) return null;
      setIsCreating(true);

      try {
        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const snapshotDir = `${projectDir}/${SNAPSHOTS_DIR}/${timestamp}`;

        const { mkdir, copyFile, readDir } = await import('@tauri-apps/plugin-fs');
        await mkdir(snapshotDir, { recursive: true });

        // Copy project.json
        await copyFile(`${projectDir}/project.json`, `${snapshotDir}/project.json`);

        // Copy chapters
        try {
          const chaptersDir = `${projectDir}/chapters`;
          const files = await readDir(chaptersDir);
          for (const file of files) {
            if (file.name) {
              await copyFile(
                `${chaptersDir}/${file.name}`,
                `${snapshotDir}/${file.name}`,
              );
            }
          }
        } catch {
          // chapters dir may not exist
        }

        const entry: SnapshotEntry = {
          id: timestamp,
          timestamp: now.toISOString(),
          label: label || `Snapshot ${timestamp}`,
        };

        setSnapshots((prev) => [entry, ...prev]);
        return entry;
      } catch {
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  /**
   * List existing snapshots for a project.
   */
  const listSnapshots = useCallback(async (projectDir: string): Promise<SnapshotEntry[]> => {
    if (!isTauri || !projectDir) return [];
    try {
      const { readDir } = await import('@tauri-apps/plugin-fs');
      const entries = await readDir(`${projectDir}/${SNAPSHOTS_DIR}`);
      const snapList: SnapshotEntry[] = [];
      for (const entry of entries) {
        if (entry.name) {
          snapList.push({
            id: entry.name,
            timestamp: entry.name.replace(/_/, 'T'),
            label: `Snapshot ${entry.name}`,
          });
        }
      }
      snapList.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setSnapshots(snapList);
      return snapList;
    } catch {
      setSnapshots([]);
      return [];
    }
  }, []);

  return { snapshots, isCreating, createSnapshot, listSnapshots };
}
