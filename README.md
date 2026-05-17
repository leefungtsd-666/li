# li

A minimalist, immersive Markdown writing tool with a Typora-like experience.

Built with **Tauri v2**, **React**, **TypeScript**, **Vite**, and **Milkdown/Crepe**.

## Features

- WYSIWYG Markdown editing via Milkdown/Crepe
- Source mode / Render mode toggle
- Headings (H1-H4), lists, blockquotes, code blocks
- Bold, italic, links, tables, images
- LaTeX math (inline and block via KaTeX)
- Right-side outline panel with heading navigation
- Light/Dark theme
- Open, save, save-as for .md/.markdown files
- New document creation
- Unsaved changes detection
- Ctrl/Cmd keyboard shortcuts
- Window decorations disabled — custom title bar
- Windows exe packaging via Tauri

## Planned Extensions

- Novel writing tools (chapters, characters, world notes)
- Word count statistics
- Writing project management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Tauri v2 (Rust) |
| Frontend | React 19 + TypeScript |
| Build | Vite 8 |
| Editor | Milkdown / Crepe (ProseMirror-based) |
| Math | KaTeX |
| File I/O | Tauri dialog + fs plugins (desktop) |
| Styling | Pure CSS with CSS custom properties |

## Prerequisites

- **Node.js** >= 18
- **Rust** / **Cargo** (latest stable)
- **Microsoft C++ Build Tools** (Windows only, for Tauri)
- **WebView2** (included in Windows 10+)

## Getting Started

### Install dependencies

```bash
npm install
```

### Run in browser dev mode

```bash
npm run dev
```

The app runs at `http://localhost:5173`. Note: file operations (open/save) require Tauri desktop mode.

### Run in Tauri desktop mode

```bash
npm run tauri:dev
```

This starts Vite dev server and opens the Tauri window.

### Build for production

```bash
npm run build
```

### Build Tauri installer (exe)

```bash
npm run tauri:build
```

This produces a Windows installer in `src-tauri/target/release/bundle/`.

## Project Structure

```
src/
  main.tsx              Entry point
  App.tsx               Root component
  app/                  App shell & layout
  components/           UI components (titlebar, outline, settings, status)
  editor/               Editor core (MarkdownEditor, SourceEditor)
  document/             File operations & document state
  outline/              Outline/table-of-contents logic
  keyboard/             Keyboard shortcut handling
  theme/                Light/dark theme
  writing/              Novel writing stubs (future)
  utils/                Utilities (debounce, slug, platform detection)
  styles/               CSS files
docs/                   Documentation
src-tauri/              Tauri Rust backend
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + N | New document |
| Ctrl/Cmd + O | Open file |
| Ctrl/Cmd + S | Save |
| Ctrl/Cmd + Shift + S | Save as |
| Ctrl/Cmd + Shift + O | Toggle outline |
| Ctrl/Cmd + A | Select all |
| Escape | Close settings menu |

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Editor Stability](docs/EDITOR_STABILITY.md)
- [Regression Checklist](docs/REGRESSION_CHECKLIST.md)
- [Codex Rules](docs/CODEX_RULES.md)
- [Roadmap](docs/ROADMAP.md)

## License

MIT
