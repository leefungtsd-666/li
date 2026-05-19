import { useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import type { EditorController, FindMatch } from './editorTypes.ts';
import { DEBUG_EDITOR } from '../utils/debugFlags.ts';

// ---- Textarea formatting helpers ----

function wrapSelection(ta: HTMLTextAreaElement, before: string, after: string): void {
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const val = ta.value;
  const selected = val.substring(start, end) || 'text';
  ta.value = val.substring(0, start) + before + selected + after + val.substring(end);
  ta.selectionStart = start + before.length;
  ta.selectionEnd = start + before.length + selected.length;
  ta.focus();
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}

function replaceLineStart(ta: HTMLTextAreaElement, prefix: string): void {
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const val = ta.value;
  // Find the start of the line(s) in the selection
  const lineStart = val.lastIndexOf('\n', start - 1) + 1;
  // Insert prefix at line start
  ta.value = val.substring(0, lineStart) + prefix + val.substring(lineStart);
  ta.selectionStart = start + prefix.length;
  ta.selectionEnd = end + prefix.length;
  ta.focus();
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}

function insertAtCursor(ta: HTMLTextAreaElement, text: string): void {
  const start = ta.selectionStart;
  const val = ta.value;
  ta.value = val.substring(0, start) + text + val.substring(ta.selectionEnd);
  ta.selectionStart = ta.selectionEnd = start + text.length;
  ta.focus();
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}

interface SourceEditorProps {
  initialContent: string;
  isComposingRef: React.MutableRefObject<boolean>;
  onContentChange: (markdown: string) => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
}

export const SourceEditor = forwardRef<EditorController, SourceEditorProps>(
  function SourceEditor(
    {
      initialContent,
      isComposingRef,
      onContentChange,
      onCompositionStart,
      onCompositionEnd,
    },
    ref,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const contentRef = useRef(initialContent);
    const onContentChangeRef = useRef(onContentChange);
    onContentChangeRef.current = onContentChange;

    useImperativeHandle(
      ref,
      () => ({
        getContent: () => contentRef.current,
        setContent: (content: string) => {
          if (isComposingRef.current) {
            if (DEBUG_EDITOR) console.log('[SourceEditor] Blocked setContent during composition');
            return;
          }
          contentRef.current = content;
          if (textareaRef.current) {
            textareaRef.current.value = content;
          }
        },
        getSelectedText: () => {
          if (!textareaRef.current) return '';
          return textareaRef.current.value.substring(
            textareaRef.current.selectionStart,
            textareaRef.current.selectionEnd,
          );
        },
        selectAll: () => {
          textareaRef.current?.select();
        },
        focus: () => {
          textareaRef.current?.focus();
        },
        destroy: () => {
          // No cleanup needed for textarea
        },

        // ---- Find & Replace ----

        getRenderedText: () => contentRef.current,
        findAllMatches: (query: string): FindMatch[] => {
          if (!query) return [];
          const text = contentRef.current;
          const matches: FindMatch[] = [];
          const lowerQuery = query.toLowerCase();
          let pos = 0;
          while (pos < text.length) {
            const idx = text.toLowerCase().indexOf(lowerQuery, pos);
            if (idx === -1) break;
            matches.push({
              from: idx,
              to: idx + query.length,
              text: text.slice(idx, idx + query.length),
            });
            pos = idx + query.length;
          }
          return matches;
        },
        selectRange: (from: number, to: number) => {
          const ta = textareaRef.current;
          if (!ta) return;
          ta.focus();
          ta.selectionStart = from;
          ta.selectionEnd = to;
        },
        replaceCurrent: (replacement: string): boolean => {
          const ta = textareaRef.current;
          if (!ta) return false;
          const { selectionStart, selectionEnd } = ta;
          if (selectionStart === selectionEnd) return false;
          const val = ta.value;
          ta.value = val.substring(0, selectionStart) + replacement + val.substring(selectionEnd);
          ta.selectionStart = ta.selectionEnd = selectionStart + replacement.length;
          contentRef.current = ta.value;
          onContentChangeRef.current(ta.value);
          return true;
        },
        replaceAllMatches: (query: string, replacement: string): number => {
          const text = contentRef.current;
          const lowerQuery = query.toLowerCase();
          const matches: { from: number; to: number }[] = [];
          let pos = 0;
          while (pos < text.length) {
            const idx = text.toLowerCase().indexOf(lowerQuery, pos);
            if (idx === -1) break;
            matches.push({ from: idx, to: idx + query.length });
            pos = idx + query.length;
          }
          if (matches.length === 0) return 0;
          // Replace in reverse
          let result = text;
          for (let i = matches.length - 1; i >= 0; i--) {
            const m = matches[i];
            result = result.substring(0, m.from) + replacement + result.substring(m.to);
          }
          const ta = textareaRef.current;
          if (ta) {
            ta.value = result;
          }
          contentRef.current = result;
          onContentChangeRef.current(result);
          return matches.length;
        },
        highlightMatches: () => {
          // No-op in source mode (textarea doesn't support decorations)
        },
        clearHighlights: () => {
          // No-op in source mode
        },

        // ---- Formatting commands ----

        toggleBold: () => {
          const ta = textareaRef.current;
          if (ta) wrapSelection(ta, '**', '**');
        },
        toggleItalic: () => {
          const ta = textareaRef.current;
          if (ta) wrapSelection(ta, '*', '*');
        },
        toggleStrikethrough: () => {
          const ta = textareaRef.current;
          if (ta) wrapSelection(ta, '~~', '~~');
        },
        setHeading: (level: 0 | 1 | 2 | 3 | 4) => {
          const ta = textareaRef.current;
          if (!ta) return;
          if (level === 0) {
            // Remove heading prefix — find the first '#' at line start
            const start = ta.selectionStart;
            const lineStart = ta.value.lastIndexOf('\n', start - 1) + 1;
            let i = lineStart;
            let hashCount = 0;
            while (i < ta.value.length && ta.value[i] === '#') { hashCount++; i++; }
            if (hashCount > 0 && ta.value[i] === ' ') {
              ta.value = ta.value.substring(0, lineStart) + ta.value.substring(i + 1);
              ta.selectionStart = Math.max(0, start - hashCount - 1);
              ta.selectionEnd = ta.selectionStart;
              ta.focus();
              ta.dispatchEvent(new Event('input', { bubbles: true }));
            }
          } else {
            replaceLineStart(ta, '#'.repeat(level) + ' ');
          }
        },
        toggleBulletList: () => {
          const ta = textareaRef.current;
          if (ta) replaceLineStart(ta, '- ');
        },
        toggleOrderedList: () => {
          const ta = textareaRef.current;
          if (ta) replaceLineStart(ta, '1. ');
        },
        toggleBlockquote: () => {
          const ta = textareaRef.current;
          if (ta) replaceLineStart(ta, '> ');
        },
        toggleCodeBlock: () => {
          const ta = textareaRef.current;
          const start = ta?.selectionStart ?? 0;
          const end = ta?.selectionEnd ?? 0;
          if (ta && start !== end) {
            wrapSelection(ta, '\n```\n', '\n```\n');
          } else if (ta) {
            insertAtCursor(ta, '\n```\n\n```\n');
          }
        },
        insertLink: (url: string, text?: string) => {
          const ta = textareaRef.current;
          if (!ta) return;
          const selected = ta.value.substring(ta.selectionStart, ta.selectionEnd);
          const linkText = text || selected || 'link';
          insertAtCursor(ta, `[${linkText}](${url})`);
        },
        insertImage: (src: string, alt?: string) => {
          const ta = textareaRef.current;
          if (!ta) return;
          insertAtCursor(ta, `![${alt || ''}](${src})`);
        },
      }),
      [isComposingRef],
    );

    const handleInput = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        contentRef.current = value;
        // Don't report to parent during IME composition — only the
        // compositionEnd handler will fire the final update.
        if (isComposingRef.current) return;
        onContentChangeRef.current(value);
      },
      [isComposingRef],
    );

    const handleCompositionEnd = useCallback(() => {
      onCompositionEnd();
      // After composition ends, report the final composed text.
      const value = textareaRef.current?.value ?? '';
      contentRef.current = value;
      onContentChangeRef.current(value);
    }, [onCompositionEnd]);

    return (
      <div className="source-editor-wrapper">
        <div className="source-editor-inner">
          <textarea
            ref={textareaRef}
            className="source-editor"
            defaultValue={initialContent}
            onChange={handleInput}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            spellCheck={false}
          />
        </div>
      </div>
    );
  },
);
