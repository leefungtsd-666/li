import { useCallback, useEffect, useState } from 'react';

export const DRAFT_STORAGE_KEY = 'li-draft';

export interface DraftData {
  content: string;
  fileName: string;
  filePath: string | null;
  savedAt: number;
}

/**
 * Manages draft recovery from localStorage.
 * - On mount, checks for an existing draft and provides recovery actions.
 * - Allows saving/clearing drafts on demand.
 */
export function useRecovery() {
  const [pendingDraft, setPendingDraft] = useState<DraftData | null>(null);

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft: DraftData = JSON.parse(raw);
      if (!draft.content || draft.content.trim().length === 0) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return;
      }
      setPendingDraft(draft);
    } catch {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, []);

  /** Save a draft to localStorage (debounced externally). */
  const saveDraft = useCallback((content: string, fileName: string, filePath: string | null) => {
    if (!content || content.trim().length === 0) return;
    const draft: DraftData = {
      content,
      fileName,
      filePath,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // localStorage full or unavailable - silently ignore
    }
  }, []);

  /** Clear the saved draft. */
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  /** Dismiss the recovery prompt without restoring. */
  const dismissRecovery = useCallback(() => {
    setPendingDraft(null);
    clearDraft();
  }, [clearDraft]);

  /** Restore the draft and clear it from storage. */
  const restoreDraft = useCallback((): DraftData | null => {
    const draft = pendingDraft;
    setPendingDraft(null);
    clearDraft();
    return draft;
  }, [pendingDraft, clearDraft]);

  return {
    pendingDraft,
    saveDraft,
    clearDraft,
    dismissRecovery,
    restoreDraft,
  };
}
