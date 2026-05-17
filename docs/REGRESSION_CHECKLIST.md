# Regression Checklist

Run these tests after any significant change to the editor, IME handling, or outline system.

## Basic Input

- [ ] Type `hello world` — space after hello works correctly
- [ ] Type `ni'hao` → result is `你好`, NOT `n你好`
- [ ] Type `xi'an` → result is `西安`
- [ ] Type `zhong'guo` → result is `中国`
- [ ] Space key selects IME candidates correctly
- [ ] Enter key confirms IME candidates correctly
- [ ] Backspace deletes Pinyin characters (not the final composed character)
- [ ] Delete key during composition does not break

## Markdown Features

- [ ] `# text` creates H1 heading
- [ ] `## text` creates H2 heading
- [ ] `- text` creates unordered list item
- [ ] `> text` creates blockquote
- [ ] `**bold**` renders bold
- [ ] `*italic*` renders italic
- [ ] `` `code` `` renders inline code
- [ ] ``` ``` code ``` ``` renders code block
- [ ] `[link](url)` renders link
- [ ] Table syntax works

## LaTeX Math

- [ ] Inline $E = mc^2$ renders correctly
- [ ] Block-level $$E = mc^2$$ renders correctly
- [ ] After save, $ is NOT escaped to \$
- [ ] After save, $$ is NOT escaped to \$\$
- [ ] Error in formula does not crash the editor
- [ ] Dark mode: formulas are readable

## Source / Render Mode

- [ ] Switching to source mode shows raw Markdown
- [ ] Switching to render mode shows rendered content
- [ ] Content is preserved when switching modes
- [ ] Switching is blocked during IME composition

## Outline / Table of Contents

- [ ] Outline updates as you type (with debounce)
- [ ] Outline does NOT update during IME composition
- [ ] Outline updates AFTER compositionend
- [ ] Empty headings are not shown
- [ ] Duplicate headings both appear and are clickable
- [ ] Clicking a heading scrolls it near the top of the editor
- [ ] Current heading is highlighted

## Keyboard Shortcuts

- [ ] Ctrl/Cmd + A in render mode selects all
- [ ] Ctrl/Cmd + A in source mode selects all
- [ ] Ctrl/Cmd + S saves the file
- [ ] Ctrl/Cmd + N creates a new document
- [ ] Ctrl/Cmd + O opens file dialog
- [ ] Ctrl/Cmd + Shift + S opens save-as dialog
- [ ] Ctrl/Cmd + Shift + O toggles outline panel
- [ ] Ctrl/Cmd + S does NOT trigger during IME composition
- [ ] Escape closes settings menu

## File Operations

- [ ] New document creates Untitled.md
- [ ] Open file reads .md file into editor
- [ ] Save writes content to original file path
- [ ] Save-as opens dialog, writes to new location
- [ ] Opening new file when dirty shows unsaved warning
- [ ] Creating new doc when dirty shows unsaved warning
- [ ] File name displayed in title bar
- [ ] Dirty state indicator (dot) appears when modified
- [ ] Dirty indicator clears after save

## Theme

- [ ] Light mode is comfortable to read
- [ ] Dark mode is comfortable to read
- [ ] Formulas are readable in dark mode
- [ ] Toggle preserves preference across restart

## Window

- [ ] Window title shows "li"
- [ ] Custom title bar renders correctly
- [ ] Window controls (min/max/close) work in Tauri mode

## General

- [ ] No console errors during normal typing
- [ ] No console errors during IME composition
- [ ] No console errors when toggling themes
- [ ] No console errors when switching modes
- [ ] Application does not crash on invalid input
