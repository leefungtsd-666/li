import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from '../utils/debounce.ts';
import { TitleBar } from '../components/titlebar/TitleBar.tsx';
import { OutlinePanel } from '../components/outline/OutlinePanel.tsx';
import { StatusBar } from '../components/status/StatusBar.tsx';
import { SettingsMenu } from '../components/settings/SettingsMenu.tsx';
import { MarkdownEditor } from '../editor/MarkdownEditor.tsx';
import { SourceEditor } from '../editor/SourceEditor.tsx';
import { FormatToolbar } from '../editor/FormatToolbar.tsx';
import { FindReplaceOverlay } from '../editor/FindReplaceOverlay.tsx';
import { useFocusMode } from '../editor/useFocusMode.ts';
import { useTheme } from '../theme/useTheme.ts';
import { useEditorComposition } from '../editor/useEditorComposition.ts';
import { useOutline } from '../outline/useOutline.ts';
import { useDocumentState } from '../document/useDocumentState.ts';
import { useKeyboardShortcuts } from '../keyboard/useKeyboardShortcuts.ts';
import { countWords } from '../writing/wordCount.ts';
import type { WordCountStats } from '../writing/writingProjectTypes.ts';
import type { EditorController, EditorMode } from '../editor/editorTypes.ts';
import { isTauri } from '../utils/platform.ts';
import { exportSingleDocAsPdf } from '../writing/exportUtils.ts';
import { ToastContext, useToastState } from '../notifications/useToast.ts';
import { ToastContainer } from '../components/notifications/ToastContainer.tsx';
import { ErrorBoundary } from '../components/ErrorBoundary.tsx';
import { LocaleContext, useLocaleState } from '../i18n/useLocale.ts';
import { useAutoSave } from '../document/useAutoSave.ts';
import { useRecovery } from '../document/useRecovery.ts';
import { useRecentFiles } from '../document/useRecentFiles.ts';
import { RecentFilesMenu } from '../components/recentfiles/RecentFilesMenu.tsx';
import { useDragDrop } from '../hooks/useDragDrop.ts';
import { DropZone } from '../components/editor/DropZone.tsx';
import { useFocusTrap } from '../hooks/useFocusTrap.ts';
import { useWritingProject } from '../writing/useWritingProject.ts';
import { useRecentProjects } from '../writing/useRecentProjects.ts';
import { useWritingStats } from '../writing/useWritingStats.ts';
import { ProjectSelector } from '../components/writing/ProjectSelector.tsx';
import { WritingSidebar } from '../components/writing/WritingSidebar.tsx';
import { ExportDialog } from '../components/writing/ExportDialog.tsx';
import { WritingStatsPanel } from '../components/writing/WritingStatsPanel.tsx';
import { handleImagePaste } from '../editor/insertImage.ts';

export function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const toastState = useToastState();
  const addToast = toastState.addToast;
  const localeState = useLocaleState();
  const { t } = localeState;
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
    openDocumentAtPath,
    saveDocument,
    saveAsDocument,
    showConfirm,
    pendingAction,
    confirmProceed,
    cancelProceed,
  } = useDocumentState(
    useCallback((msg: string) => addToast('error', msg, 5000), [addToast]),
  );
  const writingProject = useWritingProject();
  const { recentProjects, addRecentProject } = useRecentProjects();
  const writingStats = useWritingStats();

  const { autoSaveStatus } = useAutoSave(doc.isDirty, doc.filePath, isTauri, saveDocument);
  const { pendingDraft, saveDraft, clearDraft, restoreDraft, dismissRecovery } = useRecovery();
  const { recentFiles, addRecentFile, clearRecentFiles } = useRecentFiles();

  // Track file changes to update recent files list
  const prevFilePathRef = useRef(doc.filePath);
  useEffect(() => {
    if (doc.filePath && doc.filePath !== prevFilePathRef.current) {
      addRecentFile(doc.filePath, doc.fileName);
    }
    prevFilePathRef.current = doc.filePath;
  }, [doc.filePath, doc.fileName, addRecentFile]);

  const [showRecentFiles, setShowRecentFiles] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);

  // Writing project state
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [chapterToken, setChapterToken] = useState(0);
  const {
    state: projectState,
    activeChapter,
    createNewProject,
    closeProject,
    validateAndOpenProject,
    pickAndOpenProject,
    saveProject,
    setActiveChapter,
    loadChapterContent,
    setActiveChapterContent,
    saveActiveChapter,
    addChapter,
    updateChapter,
    removeChapter,
    reorderChapters,
    addCharacter,
    updateCharacter,
    removeCharacter,
    addWorldNote,
    updateWorldNote,
    removeWorldNote,
    setWordCountTarget,
  } = writingProject;

  const isProjectActive = projectState.projectDir != null;

  // ---- Content routing: chapter <-> editor ----

  const handleSelectChapter = useCallback(
    async (chapterId: string) => {
      // Save current chapter content first
      if (projectState.activeChapterId && activeChapter) {
        await saveActiveChapter();
      }
      setActiveChapter(chapterId);
      const content = await loadChapterContent(chapterId);
      setDocContent(content);
      setChapterToken((prev) => prev + 1);
      setEditorMode('render');
    },
    [projectState.activeChapterId, activeChapter, saveActiveChapter, setActiveChapter, loadChapterContent, setDocContent],
  );

  const handleAddChapter = useCallback(async () => {
    const chapter = await addChapter('New Chapter');
    if (chapter) {
      await handleSelectChapter(chapter.id);
    }
  }, [addChapter, handleSelectChapter]);

  const handleDeleteChapter = useCallback(
    async (chapterId: string) => {
      if (activeChapter?.id === chapterId) {
        // Content will be cleared
      }
      await removeChapter(chapterId);
      if (activeChapter?.id === chapterId) {
        setDocContent('');
        setChapterToken((prev) => prev + 1);
      }
    },
    [activeChapter, removeChapter, setDocContent],
  );

  // ---- Project open/create ----

  const handleOpenProject = useCallback(async () => {
    const dir = await pickAndOpenProject();
    if (dir) {
      // Load first chapter content
      const project = writingProject;
      if (project.activeChapter) {
        const content = await loadChapterContent(project.activeChapter.id);
        setDocContent(content);
        setChapterToken((prev) => prev + 1);
      }
      const meta = writingProject.state.meta;
      addRecentProject(dir, meta.title);
      setShowProjectSelector(false);
    }
  }, [pickAndOpenProject, loadChapterContent, setDocContent, addRecentProject, writingProject]);

  const handleCreateNewProject = useCallback(
    async (projectDir: string, title: string, author: string, description: string) => {
      // If projectDir is empty, we need to pick a directory first
      if (!projectDir) {
        try {
          const { pickProjectDirectory } = await import('../writing/useWritingProjectFs.ts');
          const dir = await pickProjectDirectory();
          if (!dir) return;
          projectDir = dir;
        } catch {
          addToast('error', 'Could not open directory picker', 5000);
          return;
        }
      }

      try {
        await createNewProject(projectDir, title, author, description);
        addRecentProject(projectDir, title);
        setShowProjectSelector(false);
        // The first chapter is auto-created; load it
        const state = writingProject.state;
        if (state.chapters.length > 0) {
          const content = await loadChapterContent(state.chapters[0].id);
          setDocContent(content);
          setChapterToken((prev) => prev + 1);
        }
      } catch {
        addToast('error', 'Failed to create project', 5000);
      }
    },
    [createNewProject, addRecentProject, loadChapterContent, setDocContent, addToast, writingProject],
  );

  const handleOpenRecentProject = useCallback(
    async (projectDir: string) => {
      const ok = await validateAndOpenProject(projectDir);
      if (!ok) {
        addToast('error', 'Could not open project', 5000);
        return;
      }
      const state = writingProject.state;
      addRecentProject(projectDir, state.meta.title);
      if (state.chapters.length > 0) {
        const content = await loadChapterContent(state.chapters[0].id);
        setDocContent(content);
        setChapterToken((prev) => prev + 1);
      }
      setShowProjectSelector(false);
    },
    [validateAndOpenProject, addRecentProject, loadChapterContent, setDocContent, addToast, writingProject],
  );

  const handleCloseProject = useCallback(() => {
    closeProject();
    setDocContent('');
    setChapterToken((prev) => prev + 1);
  }, [closeProject, setDocContent]);

  // ---- Drag-drop file open ----
  const { isDragging } = useDragDrop({
    onFilesDropped: useCallback(
      (filePaths: string[]) => {
        if (!isTauri) {
          addToast('warning', t('error.browserMode'), 4000);
          return;
        }
        for (const fp of filePaths) {
          openDocumentAtPath(fp);
          break;
        }
      },
      [isTauri, addToast, t, openDocumentAtPath],
    ),
  });

  const [editorMode, setEditorMode] = useState<EditorMode>('render');
  const [showOutline, setShowOutline] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [wordCount, setWordCount] = useState<WordCountStats>({ chineseChars: 0, englishWords: 0, totalChars: 0, approximateTextLength: 0 });

  const confirmDialogRef = useFocusTrap(showConfirm);
  const settingsRef = useFocusTrap(showSettings);

  const renderEditorRef = useRef<EditorController>(null);
  const sourceEditorRef = useRef<EditorController>(null);

  // ---- Phase 4: Find & Replace ----
  const [showFindReplace, setShowFindReplace] = useState(false);

  // ---- Phase 4: Focus Mode ----
  const focusMode = useFocusMode();

  // Compute active editor controller based on current mode
  const activeEditorController = editorMode === 'render'
    ? renderEditorRef.current
    : sourceEditorRef.current;

  // ---- Phase 4: Formatting helpers ----
  const handleToggleBold = useCallback(() => {
    if (editorMode === 'render') renderEditorRef.current?.toggleBold();
    else sourceEditorRef.current?.toggleBold();
  }, [editorMode]);

  const handleToggleItalic = useCallback(() => {
    if (editorMode === 'render') renderEditorRef.current?.toggleItalic();
    else sourceEditorRef.current?.toggleItalic();
  }, [editorMode]);

  const handleToggleStrikethrough = useCallback(() => {
    if (editorMode === 'render') renderEditorRef.current?.toggleStrikethrough();
    else sourceEditorRef.current?.toggleStrikethrough();
  }, [editorMode]);

  // ---- Phase 4: Image paste handler ----
  useEffect(() => {
    const handler = async (e: ClipboardEvent) => {
      if (!e.clipboardData || isComposingRef.current) return;
      // Check for image in clipboard
      for (const item of e.clipboardData.items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const projectDir = projectState.projectDir;
          const result = await handleImagePaste(projectDir);
          if (result) {
            if (editorMode === 'render') {
              renderEditorRef.current?.insertImage(result.src, result.alt);
            } else {
              sourceEditorRef.current?.insertImage(result.src, result.alt);
            }
            addToast('info', t('image.pasteSaved'), 3000);
          } else if (!isTauri) {
            // Browser mode: just insert from clipboard
            const blob = item.getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = reader.result as string;
                if (editorMode === 'render') {
                  renderEditorRef.current?.insertImage(dataUrl, 'pasted image');
                } else {
                  sourceEditorRef.current?.insertImage(dataUrl, 'pasted image');
                }
              };
              reader.readAsDataURL(blob);
            }
          }
          break;
        }
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [projectState.projectDir, editorMode, isComposingRef, addToast, t]);

  // ---- Find & Replace handlers ----
  const handleOpenFind = useCallback(() => {
    setShowFindReplace(true);
  }, []);

  const handleOpenFindReplace = useCallback(() => {
    setShowFindReplace(true);
  }, []);

  const handleCloseFindReplace = useCallback(() => {
    setShowFindReplace(false);
  }, []);

  // ---- Focus mode toggle ----
  const handleToggleFocusMode = useCallback(() => {
    focusMode.toggle();
  }, [focusMode]);

  // Wrapped newDocument/openDocument to also reset editor mode to render
  const handleNew = useCallback(() => {
    if (isProjectActive) {
      handleCloseProject();
    }
    newDocument();
    setEditorMode('render');
  }, [newDocument, isProjectActive, handleCloseProject]);

  const handleOpen = useCallback(() => {
    openDocument();
    setEditorMode('render');
  }, [openDocument]);

  // Handle content changes from editors
  const debouncedStatsUpdate = useMemo(
    () =>
      debounce((markdown: string, fileName: string, filePath: string | null) => {
        const stats = countWords(markdown);
        setWordCount(stats);
        writingStats.recordWords(stats.approximateTextLength);
        debouncedUpdate(markdown);
        saveDraft(markdown, fileName, filePath);
      }, 300),
    [debouncedUpdate, saveDraft, writingStats],
  );

  const handleContentChange = useCallback(
    (markdown: string) => {
      setDocContent(markdown);
      if (isProjectActive && projectState.activeChapterId) {
        setActiveChapterContent(markdown);
      }
      debouncedStatsUpdate(markdown, doc.fileName, doc.filePath);
    },
    [setDocContent, isProjectActive, projectState.activeChapterId, setActiveChapterContent, debouncedStatsUpdate, doc.fileName, doc.filePath],
  );

  // Wrapped save — save chapter if project active, else save document
  const handleSave = useCallback(async () => {
    if (isProjectActive) {
      await saveActiveChapter();
      await saveProject();
      addToast('info', t('autosave.saved'), 2000);
      return true;
    }
    const ok = await saveDocument();
    if (ok) {
      clearDraft?.();
    }
    return ok;
  }, [isProjectActive, saveActiveChapter, saveProject, saveDocument, clearDraft, addToast, t]);

  // Toggle editor mode
  const toggleSourceMode = useCallback(() => {
    if (isComposingRef.current) return;
    // Close find overlay on mode switch
    setShowFindReplace(false);
    setEditorMode((prev) => {
      const next = prev === 'render' ? 'source' : 'render';
      return next;
    });
  }, [isComposingRef]);

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
      onSave: handleSave,
      onSaveAs: saveAsDocument,
      onToggleOutline: toggleOutline,
      onToggleSource: toggleSourceMode,
      onSelectAllRender: () => {
        renderEditorRef.current?.selectAll();
      },
      onSelectAllSource: () => {
        sourceEditorRef.current?.selectAll();
      },
      onEscape: () => {
        if (showFindReplace) {
          handleCloseFindReplace();
        } else {
          closeSettings();
        }
      },
      // Phase 4 shortcuts
      onFind: handleOpenFind,
      onFindReplace: handleOpenFindReplace,
      onToggleBold: handleToggleBold,
      onToggleItalic: handleToggleItalic,
      onToggleStrikethrough: handleToggleStrikethrough,
      onToggleFocusMode: handleToggleFocusMode,
    }),
    [handleNew, handleOpen, handleSave, saveAsDocument, toggleSourceMode, toggleOutline, closeSettings,
     showFindReplace, handleCloseFindReplace, handleOpenFind, handleOpenFindReplace,
     handleToggleBold, handleToggleItalic, handleToggleStrikethrough, handleToggleFocusMode],
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

  // Close recent files menu on click outside
  useEffect(() => {
    if (!showRecentFiles) return;
    const handler = () => setShowRecentFiles(false);
    const timer = setTimeout(() => {
      document.addEventListener('click', handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handler);
    };
  }, [showRecentFiles]);

  // Assign outline editor ref to the editor container
  const setEditorRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        outlineEditorRef.current = node;
      }
    },
    [outlineEditorRef],
  );

  // The editor key combines mode, fileToken, and chapterToken for proper re-rendering
  const editorKey = `${editorMode}-${doc.fileToken}-${chapterToken}`;

  return (
    <LocaleContext.Provider value={localeState}>
    <ToastContext.Provider value={toastState}>
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
          fileName={isProjectActive && activeChapter ? activeChapter.title : doc.fileName}
          isDirty={doc.isDirty}
          showOutline={showOutline}
          isSourceMode={editorMode === 'source'}
          theme={theme}
          onToggleOutline={toggleOutline}
          onToggleSource={toggleSourceMode}
          onToggleTheme={toggleTheme}
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          onSettings={toggleSettings}
          autoSaveStatus={autoSaveStatus}
          projectName={isProjectActive ? projectState.meta.title : undefined}
          onProjectNew={() => setShowProjectSelector(true)}
          onProjectOpen={() => setShowProjectSelector(true)}
          onToggleFocusMode={handleToggleFocusMode}
        />
        <div style={{ position: 'absolute', top: 0, left: 76, zIndex: 1000 }}>
          <button
            className="titlebar-btn"
            onClick={() => setShowRecentFiles((prev) => !prev)}
            title="Open Recent"
            aria-label="Open Recent"
            style={{ height: 38, padding: '0 10px' }}
          >
            &#x1F4C1;
          </button>
          {showRecentFiles && (
            <RecentFilesMenu
              items={recentFiles}
              onOpen={(filePath) => {
                setEditorMode('render');
                openDocumentAtPath(filePath);
              }}
              onClear={clearRecentFiles}
              onClose={() => setShowRecentFiles(false)}
            />
          )}
        </div>

        {/* Phase 4: Format Toolbar */}
        <FormatToolbar editorController={activeEditorController} />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {isProjectActive && (
            <WritingSidebar
              chapters={projectState.chapters}
              characters={projectState.characters}
              worldNotes={projectState.worldNotes}
              activeChapterId={projectState.activeChapterId}
              wordCountTarget={projectState.wordCountTarget}
              wordCountStats={wordCount}
              onSelectChapter={handleSelectChapter}
              onAddChapter={handleAddChapter}
              onRenameChapter={(chapterId, title) => updateChapter(chapterId, { title })}
              onDeleteChapter={handleDeleteChapter}
              onReorderChapters={reorderChapters}
              onAddCharacter={addCharacter}
              onUpdateCharacter={updateCharacter}
              onRemoveCharacter={removeCharacter}
              onAddWorldNote={addWorldNote}
              onUpdateWorldNote={updateWorldNote}
              onRemoveWorldNote={removeWorldNote}
              onSetWordCountTarget={setWordCountTarget}
              onShowStats={() => setShowStatsPanel(true)}
            />
          )}

          <div
            ref={setEditorRef}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
            role="main"
            aria-label="Editor"
          >
            <ErrorBoundary
              onError={() => addToast('error', t('error.editorCrashed'), 6000)}
            >
              {editorMode === 'render' ? (
                <MarkdownEditor
                  ref={renderEditorRef}
                  key={`render-${editorKey}`}
                  initialContent={doc.content}
                  isComposingRef={isComposingRef}
                  onContentChange={handleContentChange}
                />
              ) : (
                <SourceEditor
                  ref={sourceEditorRef}
                  key={`source-${editorKey}`}
                  initialContent={doc.content}
                  isComposingRef={isComposingRef}
                  onContentChange={handleContentChange}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                />
              )}
            </ErrorBoundary>

            {/* Phase 4: Find & Replace Overlay */}
            {showFindReplace && (
              <FindReplaceOverlay
                editorController={activeEditorController}
                onClose={handleCloseFindReplace}
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
          projectName={isProjectActive ? projectState.meta.title : undefined}
        />
      </div>

      {isProjectActive && (
        <ExportDialog
          isOpen={showExportDialog}
          projectDir={projectState.projectDir!}
          projectTitle={projectState.meta.title}
          author={projectState.meta.author}
          chapters={projectState.chapters}
          onClose={() => setShowExportDialog(false)}
          onError={(msg) => addToast('error', msg, 5000)}
          onSuccess={(msg) => addToast('info', msg, 3000)}
        />
      )}

      {showStatsPanel && (
        <WritingStatsPanel
          wordCountStats={wordCount}
          onClose={() => setShowStatsPanel(false)}
        />
      )}

      <ProjectSelector
        isOpen={showProjectSelector}
        recentProjects={recentProjects}
        onNewProject={handleCreateNewProject}
        onOpenProject={handleOpenProject}
        onOpenRecent={handleOpenRecentProject}
        onClose={() => setShowProjectSelector(false)}
      />

      <div ref={settingsRef}>
        <SettingsMenu
          isOpen={showSettings}
          theme={theme}
          locale={localeState.locale}
          onToggleTheme={toggleTheme}
          onSetLocale={localeState.setLocale}
          onClose={closeSettings}
          onShowExport={() => {
            if (isProjectActive) {
              closeSettings();
              setTimeout(() => setShowExportDialog(true), 0);
            } else {
              closeSettings();
              const markdown = doc.content;
              if (!markdown) {
                addToast('error', 'Nothing to export', 3000);
                return;
              }
              const title = doc.fileName || 'untitled';
              setTimeout(async () => {
                try {
                  await exportSingleDocAsPdf(markdown, title);
                  addToast('info', 'PDF export opened', 3000);
                } catch (err) {
                  addToast('error', err instanceof Error ? err.message : 'Export failed', 5000);
                }
              }, 0);
            }
          }}
        />
      </div>

      {showConfirm && (
        <div
          ref={confirmDialogRef}
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
              {t('confirm.unsavedTitle')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              {pendingAction === 'new'
                ? t('confirm.unsavedNew')
                : t('confirm.unsavedOpen')}
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
                {t('confirm.cancel')}
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
                {t('confirm.discard')}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDraft && (
        <div
          style={{
            position: 'fixed',
            bottom: 56,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--titlebar-bg)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: '12px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 13,
            color: 'var(--text-main)',
          }}
        >
          <span>{t('recovery.title')}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            ({new Date(pendingDraft.savedAt).toLocaleTimeString()})
          </span>
          <button
            style={{
              padding: '5px 14px',
              borderRadius: 6,
              fontSize: 12,
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => {
              const draft = restoreDraft();
              if (draft) {
                setDocContent(draft.content);
              }
            }}
          >
            {t('recovery.restore')}
          </button>
          <button
            style={{
              padding: '5px 14px',
              borderRadius: 6,
              fontSize: 12,
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
            }}
            onClick={dismissRecovery}
          >
            {t('recovery.discard')}
          </button>
        </div>
      )}

      <DropZone visible={isDragging} />

      <ToastContainer />
    </ToastContext.Provider>
    </LocaleContext.Provider>
  );
}
