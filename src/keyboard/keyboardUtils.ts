import { isMac } from '../utils/platform.ts';
import { DEBUG_INPUT } from '../utils/debugFlags.ts';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  meta?: boolean;
  handler: () => void;
}

export function matchShortcut(e: KeyboardEvent, shortcut: Shortcut): boolean {
  const ctrlOrMeta = isMac ? e.metaKey : e.ctrlKey;
  if (shortcut.ctrl && !ctrlOrMeta) return false;
  if (shortcut.meta && !e.metaKey) return false;
  if (shortcut.shift && !e.shiftKey) return false;
  if (shortcut.key.toLowerCase() !== e.key.toLowerCase()) return false;
  return true;
}

export function handleShortcuts(
  e: KeyboardEvent,
  shortcuts: Shortcut[],
  preventDuringComposition: (e: KeyboardEvent) => boolean,
): boolean {
  if (preventDuringComposition(e)) return false;

  for (const shortcut of shortcuts) {
    if (matchShortcut(e, shortcut)) {
      if (DEBUG_INPUT) console.log('[Shortcut] Matched:', shortcut.key);
      e.preventDefault();
      shortcut.handler();
      return true;
    }
  }
  return false;
}
