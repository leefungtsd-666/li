import { useCallback } from 'react';

export function useEditorSelection() {
  const selectAllInRenderMode = useCallback(() => {
    const editor = document.querySelector('.milkdown');
    if (!editor) return;
    const proseMirror = editor.querySelector('.ProseMirror') as HTMLElement | null;
    if (!proseMirror) return;
    proseMirror.focus();
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(proseMirror);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  const selectAllInSourceMode = useCallback(
    (textarea: HTMLTextAreaElement | null) => {
      if (textarea) {
        textarea.focus();
        textarea.select();
      }
    },
    [],
  );

  return { selectAllInRenderMode, selectAllInSourceMode };
}
