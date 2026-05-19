import { useCallback, useEffect, useRef, useState } from 'react';

export const AUTOSAVE_INTERVAL_MS = 30000;

/**
 * Auto-saves the document every `intervalMs` when the document is dirty and has a filePath.
 * Only active in Tauri mode.
 */
export function useAutoSave(
  isDirty: boolean,
  filePath: string | null,
  isTauri: boolean,
  saveDocument: () => Promise<boolean>,
) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const savingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doAutoSave = useCallback(async () => {
    if (savingRef.current) return;
    if (!isDirty || !filePath || !isTauri) return;

    savingRef.current = true;
    setAutoSaveStatus('saving');
    try {
      const ok = await saveDocument();
      if (ok) {
        setAutoSaveStatus('saved');
        // Reset to 'idle' after 2 seconds
        setTimeout(() => {
          setAutoSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev));
        }, 2000);
      } else {
        setAutoSaveStatus('idle');
      }
    } catch {
      setAutoSaveStatus('idle');
    } finally {
      savingRef.current = false;
    }
  }, [isDirty, filePath, isTauri, saveDocument]);

  useEffect(() => {
    if (!isTauri || !filePath) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(doAutoSave, AUTOSAVE_INTERVAL_MS);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTauri, filePath, doAutoSave]);

  return { autoSaveStatus };
}
