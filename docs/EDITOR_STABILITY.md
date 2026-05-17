# Editor Stability Guidelines

This document records the stability principles applied to the li editor.

## 1. IME / Chinese Input Protection

Chinese input methods (IME) are the highest priority.

### Protected Operations

During `compositionstart` to `compositionend`:

- Keyboard shortcuts are NOT processed
- `setContent()` is NOT called on the editor
- Editor mode is NOT toggled (render ↔ source)
- Editor is NOT re-created or re-initialized
- Focus is NOT forcibly moved
- Outline directory updates ARE skipped

### IME Detection

The following checks block shortcut handling during composition:

```ts
if (isComposingRef.current) return;
if (e.isComposing) return;
if (e.key === 'Process') return;
if (e.keyCode === 229) return;
```

### Input characters NOT intercepted

- Regular alphabet keys
- Apostrophe (`'`) — critically important for Chinese IMEs (ni'hao → 你好)
- Space
- Enter
- Backspace
- Delete
- Arrow keys

## 2. Editor Not a Controlled Component

The Milkdown/Crepe editor is NOT a React controlled component:

- Initialized once on mount (useEffect with empty deps for initialization)
- Not re-created when content, dirty, theme, outline, or sourceMode change
- Content flows OUT of the editor via `onContentChange`, not INTO it
- The only times content is explicitly set: file open, new doc, mode switch

## 3. No setContent During Composition

Before calling `setContent()`, the code ALWAYS checks:

```ts
if (isComposingRef.current) {
  console.log('[Editor] Blocked setContent during composition');
  return;
}
```

## 4. No Global preventDefault

Keyboard events are NOT globally intercepted:

- No `e.preventDefault()` at the start of keydown handlers
- Only specific Ctrl/Cmd shortcuts call `e.preventDefault()` when matched
- Normal typing keys pass through without interference

## 5. Outline Scans Are Read-Only

The outline system:

- Extracts headings from markdown text (not from the DOM)
- Never modifies editor content
- Never modifies the ProseMirror document
- Uses a 250ms debounce to avoid excessive updates during typing

## 6. Error Boundaries

Editor errors (especially KaTeX rendering errors) must not crash the entire editor:

- setContent errors are caught with try/catch
- Editor initialization errors are caught with try/catch in the .catch() handler
- A bad LaTeX formula should not break the document
