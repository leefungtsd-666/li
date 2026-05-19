import { useCallback, useEffect, useRef } from 'react';

export function useFocusMode() {
  const isFocusModeRef = useRef(false);

  const toggle = useCallback(() => {
    isFocusModeRef.current = !isFocusModeRef.current;
    document.documentElement.classList.toggle('focus-mode', isFocusModeRef.current);
    return isFocusModeRef.current;
  }, []);

  const isActive = useCallback(() => isFocusModeRef.current, []);

  // Typewriter scroll: keep cursor vertically centered
  useEffect(() => {
    let rafId: number | null = null;

    const scrollToCursor = () => {
      const container = document.querySelector('.editor-container') as HTMLElement | null;
      if (!container || !isFocusModeRef.current) return;

      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const containerRect = container.getBoundingClientRect();
      const cursorCenter = rect.top + rect.height / 2;
      const containerCenter = containerRect.top + containerRect.height / 2;
      const offset = cursorCenter - containerCenter;

      if (Math.abs(offset) > 50) {
        container.scrollBy({ top: offset, behavior: 'smooth' });
      }
    };

    const scheduleScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(scrollToCursor);
    };

    document.addEventListener('selectionchange', scheduleScroll);
    return () => {
      document.removeEventListener('selectionchange', scheduleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return { toggle, isActive };
}
