import { useCallback } from 'react';
import type { EditorController } from './editorTypes.ts';
import { useLocale } from '../i18n/useLocale.ts';

interface FormatToolbarProps {
  editorController: EditorController | null;
}

export function FormatToolbar({ editorController }: FormatToolbarProps) {
  const { t } = useLocale();

  const exec = useCallback(
    (fn: (ctrl: EditorController) => void) => {
      if (editorController) fn(editorController);
    },
    [editorController],
  );

  return (
    <div className="format-toolbar" role="toolbar" aria-label="Formatting toolbar">
      <button
        className="toolbar-btn"
        onClick={() => exec((c) => c.toggleBold())}
        title="Ctrl+B"
        aria-label={t('toolbar.bold')}
      >
        <strong>B</strong>
      </button>
      <button
        className="toolbar-btn"
        onClick={() => exec((c) => c.toggleItalic())}
        title="Ctrl+I"
        aria-label={t('toolbar.italic')}
      >
        <em>I</em>
      </button>
      <button
        className="toolbar-btn"
        onClick={() => exec((c) => c.toggleStrikethrough())}
        title="Ctrl+Shift+X"
        aria-label={t('toolbar.strikethrough')}
      >
        <span style={{ textDecoration: 'line-through' }}>S</span>
      </button>

      <span className="toolbar-separator" />

      <button
        className="toolbar-btn"
        onClick={() => exec((c) => c.setHeading(1))}
        title="H1"
        aria-label={t('toolbar.h1')}
      >
        H1
      </button>
      <button
        className="toolbar-btn"
        onClick={() => exec((c) => c.setHeading(2))}
        title="H2"
        aria-label={t('toolbar.h2')}
      >
        H2
      </button>
      <button
        className="toolbar-btn"
        onClick={() => exec((c) => c.setHeading(3))}
        title="H3"
        aria-label={t('toolbar.h3')}
      >
        H3
      </button>
      <button
        className="toolbar-btn"
        onClick={() => exec((c) => c.setHeading(4))}
        title="H4"
        aria-label={t('toolbar.h4')}
      >
        H4
      </button>

      <span className="toolbar-separator" />

      <button
        className="toolbar-btn"
        onClick={() => exec((c) => c.toggleBulletList())}
        title={t('toolbar.bulletList')}
        aria-label={t('toolbar.bulletList')}
      >
        &bull;
      </button>
      <button
        className="toolbar-btn"
        onClick={() => exec((c) => c.toggleOrderedList())}
        title={t('toolbar.orderedList')}
        aria-label={t('toolbar.orderedList')}
      >
        1.
      </button>
      <button
        className="toolbar-btn"
        onClick={() => exec((c) => c.toggleBlockquote())}
        title={t('toolbar.blockquote')}
        aria-label={t('toolbar.blockquote')}
      >
        &gt;
      </button>
      <button
        className="toolbar-btn"
        onClick={() => exec((c) => c.toggleCodeBlock())}
        title={t('toolbar.codeBlock')}
        aria-label={t('toolbar.codeBlock')}
      >
        &lt;/&gt;
      </button>

      <span className="toolbar-separator" />

      <button
        className="toolbar-btn"
        onClick={() => {
          const url = prompt(t('toolbar.linkUrl')) || '';
          if (url) exec((c) => c.insertLink(url));
        }}
        title={t('toolbar.link')}
        aria-label={t('toolbar.link')}
      >
        &#x1F517;
      </button>
      <button
        className="toolbar-btn"
        onClick={() => {
          const src = prompt(t('toolbar.imageUrl')) || '';
          if (src) exec((c) => c.insertImage(src));
        }}
        title={t('toolbar.image')}
        aria-label={t('toolbar.image')}
      >
        &#x1F5BC;
      </button>
    </div>
  );
}
