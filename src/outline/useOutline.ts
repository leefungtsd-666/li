import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { OutlineItemData } from './outlineTypes.ts';
import { extractHeadings } from './outlineUtils.ts';
import { debounce } from '../utils/debounce.ts';
import { DEBUG_OUTLINE } from '../utils/debugFlags.ts';

export function useOutline() {
  const [items, setItems] = useState<OutlineItemData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const updateItems = useCallback((markdown: string) => {
    const extracted = extractHeadings(markdown);
    setItems(extracted);
    if (DEBUG_OUTLINE) console.log('[Outline] Updated:', extracted.length, 'items');
  }, []);

  const debouncedUpdate = useMemo(
    () => debounce((markdown: string) => {
      updateItems(markdown);
    }, 250),
    [updateItems],
  );

  const scrollToHeading = useCallback(
    (item: OutlineItemData) => {
      if (!editorRef.current) return;
      // The scrollable container is .editor-container inside MarkdownEditor
      const scrollContainer = editorRef.current.querySelector('.editor-container') as HTMLElement | null;
      if (!scrollContainer) return;
      const headingElements = scrollContainer.querySelectorAll(
        '.ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4',
      );
      const target = headingElements[item.index] as HTMLElement | undefined;
      if (target) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        // Position heading at the very top of the scrollable area
        const offset = targetRect.top - containerRect.top + scrollContainer.scrollTop;
        scrollContainer.scrollTo({ top: offset, behavior: 'smooth' });
        setActiveId(item.id);
      }
    },
    [],
  );

  useEffect(() => {
    if (!editorRef.current) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-heading-id');
            if (id) setActiveId(id);
          }
        }
      },
      { root: editorRef.current, threshold: 0 },
    );
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return {
    items,
    activeId,
    updateItems,
    debouncedUpdate,
    scrollToHeading,
    editorRef,
  };
}
