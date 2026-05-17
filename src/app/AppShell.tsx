import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TitleBar } from '../components/titlebar/TitleBar.tsx';
import { OutlinePanel } from '../components/outline/OutlinePanel.tsx';
import { StatusBar } from '../components/status/StatusBar.tsx';
import { SettingsMenu } from '../components/settings/SettingsMenu.tsx';
import { MarkdownEditor } from '../editor/MarkdownEditor.tsx';
import { SourceEditor } from '../editor/SourceEditor.tsx';
import { useTheme } from '../theme/useTheme.ts';
import { useEditorComposition } from '../editor/useEditorComposition.ts';
import { useOutline } from '../outline/useOutline.ts';
import { useDocumentState } from '../document/useDocumentState.ts';
import { useKeyboardShortcuts } from '../keyboard/useKeyboardShortcuts.ts';
import { countWords } from '../writing/wordCount.ts';
import type { WordCountStats } from '../writing/writingProjectTypes.ts';
import type { EditorController, EditorMode } from '../editor/editorTypes.ts';
import { isTauri } from '../utils/platform.ts';
import { DEBUG_EDITOR } from '../utils/debugFlags.ts';

export function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const {
    isComposingRef,
    handleCompositionStart,
    handleCompositionEnd,
    preventDuringComposition,
  } = useEditorComposition();
  const { items: outlineItems, activeId: outlineActiveId, debouncedUpdate, scrollToHeading, editorRef: outlineEditorRef } = useOutline();
  const {
    doc,
    setContent: setDocContent,
    newDocument,
    openDocument,
    saveDocument,
    saveAsDocument,
    showConfirm,
    pendingAction,
    confirmProceed,
    cancelProceed,
  } = useDocumentState();

  const [editorMode, setEditorMode] = useState<EditorMode>('render');
  const [showOutline, setShowOutline] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [wordCount, setWordCount] = useState<WordCountStats>({ chineseChars: 0, englishWords: 0, totalChars: 0, approximateTextLength: 0 });

  const renderEditorRef = useRef<EditorController>(null);
  const sourceEditorRef = useRef<EditorController>(null);

  // Track the current content for syncing between editors

  // Wrapped newDocument/openDocument to also reset editor mode to render
  const handleNew = useCallback(() => {
    newDocument();
    setEditorMode('render');
  }, [newDocument]);

  const handleOpen = useCallback(() => {
    openDocument();
    setEditorMode('render');
  }, [openDocument]);

  // Handle content changes from editors
  const handleContentChange = useCallback(
    (markdown: string) => {
      setDocContent(markdown);
      setWordCount(countWords(markdown));
      debouncedUpdate(markdown);
    },
    [setDocContent, debouncedUpdate],
  );

  // Toggle editor mode
  const toggleSourceMode = useCallback(() => {
    if (isComposingRef.current) return;
    setEditorMode((prev) => {
      const next = prev === 'render' ? 'source' : 'render';
      return next;
    });
  }, [isComposingRef]);

  // Sync content between editors when switching modes
  // Editors are conditionally rendered with key={mode+fileToken}, so
  // switching mode unmounts the old editor and mounts a new one with
  // initialContent={doc.content} — no ref-based sync needed.
  useEffect(() => {
    if (DEBUG_EDITOR) {
      console.log(`[AppShell] Mode switch to ${editorMode}, content length:`, doc.content.length);
    }
  }, [editorMode]);

  // Handle outline visibility
  const toggleOutline = useCallback(() => {
    setShowOutline((prev) => !prev);
  }, []);

  const closeOutline = useCallback(() => {
    setShowOutline(false);
  }, []);

  // Handle settings
  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  // Handle outline item click
  const handleOutlineClick = useCallback(
    (item: Parameters<typeof scrollToHeading>[0]) => {
      scrollToHeading(item);
    },
    [scrollToHeading],
  );

  // Keyboard shortcuts
  const shortcutHandlers = useMemo(
    () => ({
      onNew: handleNew,
      onOpen: handleOpen,
      onSave: saveDocument,
      onSaveAs: saveAsDocument,
      onToggleOutline: toggleOutline,
      onToggleSource: toggleSourceMode,
      onSelectAllRender: () => {
        renderEditorRef.current?.selectAll();
      },
      onSelectAllSource: () => {
        sourceEditorRef.current?.selectAll();
      },
      onEscape: closeSettings,
    }),
    [handleNew, handleOpen, saveDocument, saveAsDocument, toggleSourceMode, toggleOutline, closeSettings],
  );

  useKeyboardShortcuts({
    handlers: shortcutHandlers,
    isSourceMode: editorMode === 'source',
    preventDuringComposition,
  });

  // Close settings on click outside
  useEffect(() => {
    if (!showSettings) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.titlebar-btn, .titlebar-controls')) return;
      closeSettings();
    };
    const timer = setTimeout(() => {
      document.addEventListener('click', handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handler);
    };
  }, [showSettings, closeSettings]);

  // Assign outline editor ref to the editor container
  const setEditorRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        outlineEditorRef.current = node;
      }
    },
    [outlineEditorRef],
  );

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          background: 'var(--app-bg)',
        }}
      >
        <TitleBar
          fileName={doc.fileName}
          isDirty={doc.isDirty}
          showOutline={showOutline}
          isSourceMode={editorMode === 'source'}
          theme={theme}
          onToggleOutline={toggleOutline}
          onToggleSource={toggleSourceMode}
          onToggleTheme={toggleTheme}
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={saveDocument}
          onSettings={toggleSettings}
        />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div
            ref={setEditorRef}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            {editorMode === 'render' ? (
              <MarkdownEditor
                ref={renderEditorRef}
                key={`render-${doc.fileToken}`}
                initialContent={doc.content}
                isComposingRef={isComposingRef}
                onContentChange={handleContentChange}
              />
            ) : (
              <SourceEditor
                ref={sourceEditorRef}
                key={`source-${doc.fileToken}`}
                initialContent={doc.content}
                isComposingRef={isComposingRef}
                onContentChange={handleContentChange}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
              />
            )}
          </div>

          {showOutline && (
            <OutlinePanel
              items={outlineItems}
              activeId={outlineActiveId}
              onItemClick={handleOutlineClick}
              onClose={closeOutline}
            />
          )}
        </div>

        <StatusBar
          wordCount={wordCount}
          isSourceMode={editorMode === 'source'}
          isTauri={isTauri}
        />
      </div>

      <SettingsMenu
        isOpen={showSettings}
        theme={theme}
        onToggleTheme={toggleTheme}
        onClose={closeSettings}
      />

      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              background: 'var(--titlebar-bg)',
              borderRadius: 10,
              padding: 24,
              minWidth: 320,
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--text-main)' }}>
              Unsaved Changes
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              {pendingAction === 'new'
                ? 'Create a new document? Your current changes will be lost.'
                : 'Open a different file? Your current changes will be lost.'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                style={{
                  padding: '7px 16px',
                  borderRadius: 6,
                  fontSize: 13,
                  background: 'var(--button-hover)',
                  color: 'var(--text-main)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={cancelProceed}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '7px 16px',
                  borderRadius: 6,
                  fontSize: 13,
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={confirmProceed}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
