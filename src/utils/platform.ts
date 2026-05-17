export const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

declare const window: Window & { __TAURI_INTERNALS__?: unknown };

export const isTauri =
  typeof window !== 'undefined' && window.__TAURI_INTERNALS__ != null;

export const modifierKey = isMac ? '⌘' : 'Ctrl';

export function getModifierLabel(key: string): string {
  return isMac ? `⌘${key}` : `Ctrl+${key.toUpperCase()}`;
}
