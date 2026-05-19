import { useCallback, useState } from 'react';
import type { UpdateStatus } from './updaterTypes.ts';
import { isTauri } from '../utils/platform.ts';

/**
 * Hook for checking and installing app updates via the Tauri updater plugin.
 * Falls back gracefully when not in Tauri or when no update server is configured.
 */
export function useUpdater() {
  const [status, setStatus] = useState<UpdateStatus>({ type: 'idle' });

  const checkForUpdates = useCallback(async () => {
    if (!isTauri) return;

    setStatus({ type: 'checking' });

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const result = await check();
      // check() returns null when no update available

      if (result) {
        setStatus({
          type: 'available',
          version: result.version || 'unknown',
          body: result.body || '',
          date: result.date,
        });
      } else {
        setStatus({ type: 'idle' });
      }
    } catch {
      setStatus({ type: 'idle' });
    }
  }, []);

  const downloadAndInstall = useCallback(async () => {
    if (!isTauri) return;

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const result = await check();
      if (!result) return;

      setStatus({ type: 'downloading', progress: 0 });

      await result.downloadAndInstall((progress) => {
        if (progress.event === 'Started' && progress.data.contentLength) {
          setStatus({ type: 'downloading', progress: 0 });
        }
      });

      setStatus({ type: 'readyToInstall' });
    } catch {
      setStatus({ type: 'error', message: 'Download failed' });
    }
  }, []);

  const installUpdate = useCallback(async () => {
    if (!isTauri) return;

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const result = await check();
      if (result) {
        await result.install();
      }
    } catch {
      setStatus({ type: 'error', message: 'Install failed' });
    }
  }, []);

  return { status, checkForUpdates, downloadAndInstall, installUpdate };
}
