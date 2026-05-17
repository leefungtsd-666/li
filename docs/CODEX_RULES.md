# Codex Rules

These rules govern contributions to the li codebase.

## Core Principles

1. **Modify UI without touching the editor core.** CSS and component changes should never require editing MarkdownEditor.tsx or SourceEditor.tsx.

2. **Modify icons/buttons without touching MarkdownEditor.** TitleBar controls, outline buttons, and settings are in `components/` — keep editor files pristine.

3. **Modify theme without touching IME logic.** Theme changes in `theme/` and `styles/` must never alter `useEditorComposition.ts`.

4. **Modify outline styles without touching outline extraction logic.** Outline CSS is in `styles/outline.css`. The extraction logic in `outline/useOutline.ts` and `outline/outlineUtils.ts` must not be touched for visual changes.

5. **Modify packaging/build without touching the editor.** Tauri config and bundler changes should never require edits to `editor/` files.

## Change Log Requirements

These operations REQUIRE a documented reason in the commit message:

- **keydown** — any change to keyboard event handling
- **beforeinput** — any change to input event processing
- **compositionstart / compositionend / compositionupdate** — any change to IME composition handling
- **onUpdate** — any change to the editor's content update callback
- **setContent** — any call to set content on the editor (must include IME safety check)
- **Editor re-initialization** — any change that causes the editor to be destroyed and re-created

## IME Safety Checklist

Before submitting changes involving keyboard or input:

- [ ] Are we checking `isComposingRef.current` before shortcuts?
- [ ] Are we checking `e.isComposing` before shortcuts?
- [ ] Are we checking `e.key === 'Process'` before shortcuts?
- [ ] Are we checking `e.keyCode === 229` before shortcuts?
- [ ] Do we avoid `setContent` during composition?
- [ ] Do we avoid mode toggle during composition?
- [ ] Do we avoid editor re-creation during composition?
- [ ] Do we avoid global `preventDefault()` in keydown?
- [ ] Do we preserve apostrophe during composition?
- [ ] Do we preserve Space/Enter/Backspace/Delete during composition?

## Testing Requirements

Any change touching editor, IME, or outline must pass the [Regression Checklist](REGRESSION_CHECKLIST.md) before merging.
