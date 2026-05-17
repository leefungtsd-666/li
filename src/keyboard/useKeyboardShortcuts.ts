import { useEffect, useCallback } from 'react';
import { handleShortcuts, type Shortcut } from './keyboardUtils.ts';
import { isMac } from '../utils/platform.ts';

interface ShortcutHandlers {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onToggleSource: () => void;
  onToggleOutline: () => void;
  onSelectAllRender: () => void;
  onSelectAllSource: () => void;
  onEscape: () => void;
}

interface UseKeyboardShortcutsOptions {
  handlers: ShortcutHandlers;
  isSourceMode: boolean;
  preventDuringComposition: (e: KeyboardEvent) => boolean;
}

export function useKeyboardShortcuts({
  handlers,
  isSourceMode,
  preventDuringComposition,
}: UseKeyboardShortcutsOptions) {
  const getShortcuts = useCallback((): Shortcut[] => {
    const ctrlKey = isMac ? 'meta' : 'ctrl';
    const shortcuts: Shortcut[] = [
      { key: 'n', [ctrlKey]: true, handler: handlers.onNew },
      { key: 'o', [ctrlKey]: true, handler: handlers.onOpen },
      { key: 's', [ctrlKey]: true, handler: handlers.onSave },
      { key: 's', [ctrlKey]: true, shift: true, handler: handlers.onSaveAs },
      { key: 'o', [ctrlKey]: true, shift: true, handler: handlers.onToggleOutline },
      { key: '/', [ctrlKey]: true, handler: handlers.onToggleSource },
      { key: 'Escape', handler: handlers.onEscape },
    ];

    if (isSourceMode) {
      shortcuts.push({
        key: 'a',
        [ctrlKey]: true,
        handler: handlers.onSelectAllSource,
      });
    } else {
      shortcuts.push({
        key: 'a',
        [ctrlKey]: true,
        handler: handlers.onSelectAllRender,
      });
    }

    return shortcuts;
  }, [handlers, isSourceMode]);

  useEffect(() => {
    const shortcuts = getShortcuts();
    const onKeyDown = (e: KeyboardEvent) => {
      handleShortcuts(e, shortcuts, preventDuringComposition);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [getShortcuts, preventDuringComposition]);
}
