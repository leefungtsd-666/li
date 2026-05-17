# li Architecture

## Overview

li is a desktop Markdown writing application built on Tauri v2 + React + Milkdown/Crepe.

The architecture follows a **unidirectional data flow** pattern:

```
User Input → Editor (Milkdown/Crepe) → Content Change Callback → Document State → UI Update
                                                                       ↓
                                                                  Outline Update
                                                                  Word Count Update
```

## Key Design Decisions

### 1. Editor is NOT a controlled component

The Milkdown/Crepe editor initializes once and manages its own internal state. React does not push content back into the editor. Instead:

- **Editor → React**: The editor fires `onContentChange` callbacks on each update
- **React → Editor**: Only happens on explicit actions (file open, new document, mode switch) via the `EditorController` ref

### 2. Keyboard shortcuts are separate from editor

Shortcuts are handled at the `AppShell` level using a `useKeyboardShortcuts` hook. They are NOT intercepted inside the editor, which prevents conflicts with IME composition.

### 3. File operations are centralized

The `document/` directory contains all file-related logic. No UI component directly calls Tauri file APIs. This makes it easy to swap implementations or add error handling.

### 4. IME protection is built-in from day one

The `useEditorComposition` hook tracks composition state via refs (not state), so the editor never re-renders during composition. All keyboard shortcut handlers check `isComposing` before acting.

## Module Layers

```
┌─────────────────────────────────────────────┐
│  AppShell (orchestrator)                     │
│  - Manages all state and hooks              │
│  - Wires editor, file, theme, keyboard      │
├─────────────────────────────────────────────┤
│  Components (presentation)                  │
│  - TitleBar, OutlinePanel, StatusBar        │
│  - Pure props-in, events-out                │
├─────────────────────────────────────────────┤
│  Editor (controlled via ref)                │
│  - MarkdownEditor (Crepe/ProseMirror)       │
│  - SourceEditor (textarea)                  │
│  - Not a controlled component               │
├─────────────────────────────────────────────┤
│  Hooks (logic)                              │
│  - useDocumentState, useOutline             │
│  - useKeyboardShortcuts, useTheme           │
│  - useEditorComposition, useEditorController│
├─────────────────────────────────────────────┤
│  Utils & Types                              │
│  - debounce, slug, platform, debugFlags     │
│  - Document types, outline types, editor    │
│    types, writing project types             │
└─────────────────────────────────────────────┘
```

## Data Flow for Key Actions

### Typing
```
User types → ProseMirror handles → Crepe.on('updated') →
onContentChange(markdown) → setDocContent → update UI
                                                        → debouncedUpdate(outline)
                                                        → countWords(wordCount)
```

### File Open
```
User clicks open → checkDirtyAndProceed → showOpenDialog → readFile →
setDoc({ content, filePath, savedContent }) → re-render →
Editor gets new initialContent via key change
```

### Mode Switch (Render ↔ Source)
```
User clicks source toggle → editorMode changes →
Current editor content is read via getContent() →
Other editor gets content via setContent() or key change
```

## Future Architecture

When novel writing features are added, a `WritingProjectStore` will sit alongside `useDocumentState`, managing chapters, characters, and world notes.
