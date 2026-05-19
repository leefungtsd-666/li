import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Crepe, CrepeFeature } from '@milkdown/crepe';
import { editorViewCtx, parserCtx, editorViewOptionsCtx } from '@milkdown/kit/core';
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import katex from 'katex';
import type { EditorController, FindMatch } from './editorTypes.ts';
import { DEBUG_EDITOR } from '../utils/debugFlags.ts';
import { Decoration, DecorationSet } from '@milkdown/prose/view';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { TextSelection } from '@milkdown/prose/state';
import { toggleMark, setBlockType, wrapIn } from '@milkdown/prose/commands';
import { wrapInList } from '@milkdown/prose/schema-list';

const findPluginKey = new PluginKey('find-highlight');

// Module-level storage for find decorations (stateless plugin pattern).
// Stateful plugins cannot be passed via editorViewOptionsCtx.plugins.
let currentFindDecorations: DecorationSet = DecorationSet.empty;

const findHighlightPlugin = new Plugin({
  key: findPluginKey,
  props: {
    decorations() {
      return currentFindDecorations;
    },
  },
});

// Custom syntax highlight colors for code blocks (replaces Crepe's default oneDark).
// Fixes the issue where CodeMirror's defaultHighlightStyle colors strings/errors red.
const codeBlockHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#c678dd' },                // violet
  { tag: tags.comment, color: '#7d8799', fontStyle: 'italic' }, // gray
  { tag: tags.string, color: '#98c379' },                  // sage green
  { tag: tags.number, color: '#d19a66' },                  // orange
  { tag: tags.bool, color: '#d19a66' },                    // orange
  { tag: tags.atom, color: '#d19a66' },                    // orange
  { tag: tags.typeName, color: '#e5c07b' },                // yellow
  { tag: tags.className, color: '#e5c07b' },               // yellow
  { tag: tags.namespace, color: '#e5c07b' },               // yellow
  { tag: [tags.function(tags.variableName), tags.labelName], color: '#61afef' }, // blue
  { tag: [tags.definition(tags.name), tags.separator], color: '#abb2bf' },       // light gray
  { tag: tags.propertyName, color: '#e06c75' },            // coral
  { tag: tags.macroName, color: '#e06c75' },               // coral
  { tag: [tags.operator, tags.operatorKeyword], color: '#56b6c2' },  // cyan
  { tag: [tags.url, tags.escape, tags.regexp, tags.link], color: '#56b6c2' },  // cyan
  { tag: [tags.special(tags.string)], color: '#56b6c2' },  // cyan
  { tag: tags.meta, color: '#7d8799' },                    // gray
  { tag: tags.invalid, color: '#7d8799' },                  // gray, NOT red!
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.link, color: '#56b6c2', textDecoration: 'underline' },
  { tag: tags.heading, fontWeight: 'bold', color: '#e06c75' },
  { tag: [tags.inserted, tags.literal], color: '#98c379' },
  { tag: tags.deleted, color: '#e06c75' },
]);

const codeBlockTheme = EditorView.theme({
  '&': {
    color: '#abb2bf',
  },
}, { dark: true });

const codeBlockExtensions = [codeBlockTheme, syntaxHighlighting(codeBlockHighlightStyle)];

interface MarkdownEditorProps {
  initialContent: string;
  isComposingRef: React.MutableRefObject<boolean>;
  onContentChange: (markdown: string) => void;
}

export const MarkdownEditor = forwardRef<EditorController, MarkdownEditorProps>(
  function MarkdownEditor(
    {
      initialContent,
      isComposingRef,
      onContentChange,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const crepeRef = useRef<Crepe | null>(null);
    const initializedRef = useRef(false);
    const contentRef = useRef(initialContent);
    const pendingContentRef = useRef<string | null>(null);
    const onContentChangeRef = useRef(onContentChange);
    const [initError, setInitError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    onContentChangeRef.current = onContentChange;

    useImperativeHandle(
      ref,
      () => ({
        getContent: () => contentRef.current,
        setContent: (content: string) => {
          if (isComposingRef.current) {
            if (DEBUG_EDITOR) console.log('[Editor] Blocked setContent during composition');
            return;
          }
          contentRef.current = content;
          const crepe = crepeRef.current;
          if (!crepe) {
            pendingContentRef.current = content;
            return;
          }
          try {
            const editor = crepe.editor;
            if (!editor || editor.status !== 'Created') {
              pendingContentRef.current = content;
              return;
            }
            editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const parser = ctx.get(parserCtx);
              const doc = parser(content);
              if (!doc) return;
              const { tr } = view.state;
              view.dispatch(tr.replaceWith(0, view.state.doc.content.size, doc));
            });
          } catch (e) {
            console.error('[Editor] setContent error:', e);
          }
        },
        getSelectedText: () => {
          const crepe = crepeRef.current;
          if (!crepe) return '';
          try {
            const editor = crepe.editor;
            if (!editor || editor.status !== 'Created') return '';
            return editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const { from, to } = view.state.selection;
              return view.state.doc.textBetween(from, to);
            });
          } catch {
            return '';
          }
        },
        selectAll: () => {
          const container = containerRef.current;
          if (!container) return;
          const proseMirror = container.querySelector('.ProseMirror') as HTMLElement | null;
          if (proseMirror) {
            proseMirror.focus();
            const selection = window.getSelection();
            if (selection) {
              const range = document.createRange();
              range.selectNodeContents(proseMirror);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        },
        focus: () => {
          const container = containerRef.current;
          if (!container) return;
          const proseMirror = container.querySelector('.ProseMirror') as HTMLElement | null;
          proseMirror?.focus();
        },
        destroy: () => {
          crepeRef.current?.destroy();
          crepeRef.current = null;
          initializedRef.current = false;
        },

        // ---- Find & Replace ----

        getRenderedText: () => {
          const crepe = crepeRef.current;
          if (!crepe) return '';
          try {
            return crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              return view.state.doc.textBetween(0, view.state.doc.content.size);
            });
          } catch {
            return '';
          }
        },
        findAllMatches: (query: string): FindMatch[] => {
          if (!query) return [];
          const crepe = crepeRef.current;
          if (!crepe) return [];
          try {
            return crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const text = view.state.doc.textBetween(0, view.state.doc.content.size);
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
            });
          } catch {
            return [];
          }
        },
        selectRange: (from: number, to: number) => {
          const crepe = crepeRef.current;
          if (!crepe) return;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const sel = TextSelection.create(view.state.doc, from, to);
              view.dispatch(view.state.tr.setSelection(sel));
              view.focus();
            });
          } catch {
            // ignore
          }
        },
        replaceCurrent: (replacement: string): boolean => {
          const crepe = crepeRef.current;
          if (!crepe) return false;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const { from, to } = view.state.selection;
              if (from === to) return;
              view.dispatch(view.state.tr.replaceWith(from, to, view.state.schema.text(replacement)));
            });
            return true;
          } catch {
            return false;
          }
        },
        replaceAllMatches: (query: string, replacement: string): number => {
          const crepe = crepeRef.current;
          if (!crepe) return 0;
          try {
            return crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const doc = view.state.doc;
              const text = doc.textBetween(0, doc.content.size);
              const lowerQuery = query.toLowerCase();
              const matches: { from: number; to: number }[] = [];
              let pos = 0;
              while (pos < text.length) {
                const idx = text.toLowerCase().indexOf(lowerQuery, pos);
                if (idx === -1) break;
                matches.push({ from: idx, to: idx + query.length });
                pos = idx + query.length;
              }
              // Replace in reverse order to preserve positions
              let tr = view.state.tr;
              for (let i = matches.length - 1; i >= 0; i--) {
                const m = matches[i];
                tr = tr.replaceWith(m.from, m.to, view.state.schema.text(replacement));
              }
              view.dispatch(tr);
              return matches.length;
            });
          } catch {
            return 0;
          }
        },
        highlightMatches: (matches: FindMatch[], activeIndex: number) => {
          const crepe = crepeRef.current;
          if (!crepe) return;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const decorations = matches.map((m, i) =>
                Decoration.inline(m.from, m.to, {
                  class: i === activeIndex ? 'find-highlight-active' : 'find-highlight',
                }),
              );
              currentFindDecorations = DecorationSet.create(view.state.doc, decorations);
              // Dispatch a transaction to trigger re-render
              view.dispatch(view.state.tr.setMeta('find-highlight-refresh', true));
            });
          } catch {
            // ignore
          }
        },
        clearHighlights: () => {
          const crepe = crepeRef.current;
          if (!crepe) return;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              currentFindDecorations = DecorationSet.empty;
              view.dispatch(view.state.tr.setMeta('find-highlight-refresh', true));
            });
          } catch {
            // ignore
          }
        },

        // ---- Formatting commands ----

        toggleBold: () => {
          const crepe = crepeRef.current;
          if (!crepe) return;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const cmd = toggleMark(view.state.schema.marks.strong);
              cmd(view.state, view.dispatch);
              view.focus();
            });
          } catch {
            // ignore
          }
        },
        toggleItalic: () => {
          const crepe = crepeRef.current;
          if (!crepe) return;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const cmd = toggleMark(view.state.schema.marks.em);
              cmd(view.state, view.dispatch);
              view.focus();
            });
          } catch {
            // ignore
          }
        },
        toggleStrikethrough: () => {
          const crepe = crepeRef.current;
          if (!crepe) return;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const cmd = toggleMark(view.state.schema.marks.strikethrough);
              cmd(view.state, view.dispatch);
              view.focus();
            });
          } catch {
            // ignore
          }
        },
        setHeading: (level: 0 | 1 | 2 | 3 | 4) => {
          const crepe = crepeRef.current;
          if (!crepe) return;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              if (level === 0) {
                const cmd = setBlockType(view.state.schema.nodes.paragraph);
                cmd(view.state, view.dispatch);
              } else {
                const cmd = setBlockType(view.state.schema.nodes.heading, { level });
                cmd(view.state, view.dispatch);
              }
              view.focus();
            });
          } catch {
            // ignore
          }
        },
        toggleBulletList: () => {
          const crepe = crepeRef.current;
          if (!crepe) return;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const cmd = wrapInList(view.state.schema.nodes.bullet_list);
              cmd(view.state, view.dispatch);
              view.focus();
            });
          } catch {
            // ignore
          }
        },
        toggleOrderedList: () => {
          const crepe = crepeRef.current;
          if (!crepe) return;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const cmd = wrapInList(view.state.schema.nodes.ordered_list);
              cmd(view.state, view.dispatch);
              view.focus();
            });
          } catch {
            // ignore
          }
        },
        toggleBlockquote: () => {
          const crepe = crepeRef.current;
          if (!crepe) return;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const cmd = wrapIn(view.state.schema.nodes.blockquote);
              cmd(view.state, view.dispatch);
              view.focus();
            });
          } catch {
            // ignore
          }
        },
        toggleCodeBlock: () => {
          const crepe = crepeRef.current;
          if (!crepe) return;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const cmd = setBlockType(view.state.schema.nodes.code_block);
              cmd(view.state, view.dispatch);
              view.focus();
            });
          } catch {
            // ignore
          }
        },
        insertLink: (url: string, _text?: string) => {
          const crepe = crepeRef.current;
          if (!crepe) return;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const cmd = toggleMark(view.state.schema.marks.link, { href: url });
              cmd(view.state, view.dispatch);
              view.focus();
            });
          } catch {
            // ignore
          }
        },
        insertImage: (src: string, alt?: string) => {
          const crepe = crepeRef.current;
          if (!crepe) return;
          try {
            crepe.editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const node = view.state.schema.nodes.image.create({ src, alt: alt || '' });
              view.dispatch(view.state.tr.replaceSelectionWith(node));
              view.focus();
            });
          } catch {
            // ignore
          }
        },
      }),
      [isComposingRef],
    );

    // Initialize Crepe on mount, destroy on unmount
    // Remounting is controlled via `key` prop from parent
    useEffect(() => {
      if (!containerRef.current) {
        console.error('[Editor] containerRef is null, cannot initialize');
        return;
      }

      console.log('[Editor] Creating Crepe with initialContent length:', initialContent.length);

      const crepe = new Crepe({
        root: containerRef.current,
        defaultValue: initialContent,
        features: {
          [Crepe.Feature.Latex]: true,
          [Crepe.Feature.CodeMirror]: true,
          [Crepe.Feature.Placeholder]: true,
          // Disable UI features that show permanently without interaction
          [Crepe.Feature.BlockEdit]: false,
          [Crepe.Feature.LinkTooltip]: false,
          [Crepe.Feature.ImageBlock]: false,
        },
        featureConfigs: {
          [CrepeFeature.CodeMirror]: {
            theme: codeBlockExtensions,
          },
        },
      });

      // Override Crepe's buggy toDOM for math_inline (returns a DOM element
      // which ProseMirror's renderSpec doesn't handle). Register a custom
      // node view that renders katex inline math properly.
      // Also register the find highlight plugin for find & replace.
      crepe.editor.config((ctx) => {
        ctx.update(editorViewOptionsCtx, (prev) => {
          const prevAny = prev as { nodeViews?: Record<string, unknown>; plugins?: readonly import('@milkdown/prose/state').Plugin[] };
          return {
            ...prevAny,
            nodeViews: {
              ...prevAny.nodeViews,
              math_inline: (node: import('@milkdown/prose/model').Node) => {
                const value = String(node.attrs.value ?? '');
                const dom = document.createElement('span');
                dom.dataset.type = 'math_inline';
                dom.dataset.value = value;
                katex.render(value, dom, { throwOnError: false });
                return { dom };
              },
            },
            plugins: [...(prevAny.plugins ?? []), findHighlightPlugin],
          } as typeof prev;
        });
      });

      crepe
        .create()
        .then(() => {
          crepeRef.current = crepe;
          initializedRef.current = true;
          if (DEBUG_EDITOR) console.log('[Editor] Crepe initialized, initialContent length:', initialContent.length);

          // Determine what content to display:
          // 1. Pending content (setContent called before Crepe was ready) wins
          // 2. Otherwise use initialContent prop
          const contentToShow = pendingContentRef.current ?? initialContent;

          if (contentToShow) {
            if (DEBUG_EDITOR) console.log('[Editor] Applying content, length:', contentToShow.length);
            try {
              const editor = crepe.editor;
              if (editor && editor.status === 'Created') {
                editor.action((ctx) => {
                  const view = ctx.get(editorViewCtx);
                  const parser = ctx.get(parserCtx);
                  const doc = parser(contentToShow);
                  if (doc) {
                    view.dispatch(
                      view.state.tr.replaceWith(0, view.state.doc.content.size, doc),
                    );
                  }
                });
              }
            } catch (e) {
              console.error('[Editor] Failed to apply content:', e);
            }
          }
          pendingContentRef.current = null;

          setIsReady(true);

          crepe.on((listener) => {
            listener.updated(() => {
              const md = crepe.getMarkdown();
              contentRef.current = md;
              onContentChangeRef.current(md);
            });
          });
        })
        .catch((err: unknown) => {
          console.error('[Editor] Crepe init error:', err);
          setInitError(String(err));
        });

      return () => {
        if (DEBUG_EDITOR) console.log('[Editor] Cleaning up Crepe');
        crepe.destroy();
        crepeRef.current = null;
        initializedRef.current = false;
      };
    }, []);

    return (
      <div className="editor-container">
        <div className="editor-inner">
          <div ref={containerRef} />
          {initError && (
            <div style={{ color: 'red', padding: 16, fontSize: 13 }}>
              Crepe init error: {initError}
            </div>
          )}
          {!isReady && !initError && (
            <div style={{ color: 'var(--text-muted)', padding: 32, textAlign: 'center', fontSize: 14 }}>
              Initializing editor...
            </div>
          )}
          {isReady && !initialContent && (
            <div style={{ color: 'var(--text-muted)', padding: 32, textAlign: 'center', fontSize: 14 }}>
              Start typing...
            </div>
          )}
        </div>
      </div>
    );
  },
);
