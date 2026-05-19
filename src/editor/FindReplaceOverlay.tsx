import { useCallback, useEffect, useRef, useState } from 'react';
import type { EditorController, FindMatch } from './editorTypes.ts';
import { useLocale } from '../i18n/useLocale.ts';

interface FindReplaceOverlayProps {
  editorController: EditorController | null;
  onClose: () => void;
}

export function FindReplaceOverlay({ editorController, onClose }: FindReplaceOverlayProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matches, setMatches] = useState<FindMatch[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showReplace, setShowReplace] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the search input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(
    (q: string) => {
      if (!editorController || !q) {
        setMatches([]);
        setActiveIndex(0);
        editorController?.clearHighlights();
        return;
      }
      const results = editorController.findAllMatches(q);
      setMatches(results);
      setActiveIndex(0);
      if (results.length > 0) {
        editorController.highlightMatches(results, 0);
        editorController.selectRange(results[0].from, results[0].to);
      } else {
        editorController.clearHighlights();
      }
    },
    [editorController],
  );

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setQuery(q);
      doSearch(q);
    },
    [doSearch],
  );

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (matches.length === 0) return;
      const next = (activeIndex + dir + matches.length) % matches.length;
      setActiveIndex(next);
      editorController?.highlightMatches(matches, next);
      editorController?.selectRange(matches[next].from, matches[next].to);
    },
    [matches, activeIndex, editorController],
  );

  const handleReplace = useCallback(() => {
    if (!editorController || !query) return;
    const ok = editorController.replaceCurrent(replaceText);
    if (ok) {
      // Re-search to update match positions
      doSearch(query);
    }
  }, [editorController, query, replaceText, doSearch]);

  const handleReplaceAll = useCallback(() => {
    if (!editorController || !query) return;
    const count = editorController.replaceAllMatches(query, replaceText);
    if (count > 0) {
      doSearch(query);
    }
  }, [editorController, query, replaceText, doSearch]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        editorController?.clearHighlights();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [editorController, onClose]);

  // Enter to navigate, Shift+Enter to navigate backwards
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          navigate(-1);
        } else {
          navigate(1);
        }
      }
    },
    [navigate],
  );

  // Cleanup highlights on unmount
  useEffect(() => {
    return () => {
      editorController?.clearHighlights();
    };
  }, [editorController]);

  return (
    <div className="find-replace-overlay" role="dialog" aria-label={t('find.title')}>
      <div className="find-row">
        <input
          ref={inputRef}
          className="find-input"
          type="text"
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          placeholder={t('find.placeholder')}
          aria-label={t('find.placeholder')}
        />
        <span className="find-count">
          {query ? `${activeIndex + 1}/${matches.length}` : ''}
        </span>
        <button
          className="find-btn"
          onClick={() => navigate(-1)}
          disabled={matches.length === 0}
          title={t('find.previous')}
          aria-label={t('find.previous')}
        >
          &#x25B2;
        </button>
        <button
          className="find-btn"
          onClick={() => navigate(1)}
          disabled={matches.length === 0}
          title={t('find.next')}
          aria-label={t('find.next')}
        >
          &#x25BC;
        </button>
        <button
          className="find-btn find-toggle-btn"
          onClick={() => setShowReplace((p) => !p)}
          title={t('find.replace')}
          aria-label={t('find.replace')}
        >
          {showReplace ? '\u25BC' : '\u25B6'}
        </button>
        <button
          className="find-btn find-close-btn"
          onClick={() => {
            editorController?.clearHighlights();
            onClose();
          }}
          title={t('find.close')}
          aria-label={t('find.close')}
        >
          &times;
        </button>
      </div>
      {showReplace && (
        <div className="find-row">
          <input
            className="find-input"
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) handleReplaceAll();
                else handleReplace();
              }
            }}
            placeholder={t('find.replacePlaceholder')}
            aria-label={t('find.replacePlaceholder')}
          />
          <button
            className="find-btn"
            onClick={handleReplace}
            disabled={matches.length === 0}
            title={t('find.replaceOne')}
            aria-label={t('find.replaceOne')}
          >
            {t('find.replaceOne')}
          </button>
          <button
            className="find-btn"
            onClick={handleReplaceAll}
            disabled={matches.length === 0}
            title={t('find.replaceAll')}
            aria-label={t('find.replaceAll')}
          >
            {t('find.replaceAll')}
          </button>
        </div>
      )}
    </div>
  );
}
