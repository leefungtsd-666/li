import { useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import type { EditorController } from './editorTypes.ts';
import { DEBUG_EDITOR } from '../utils/debugFlags.ts';

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
