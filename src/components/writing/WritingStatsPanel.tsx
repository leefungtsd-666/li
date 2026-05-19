import { useCallback } from 'react';
import { useLocale } from '../../i18n/useLocale.ts';
import { useWritingStats } from '../../writing/useWritingStats.ts';
import type { WordCountStats } from '../../writing/writingProjectTypes.ts';

interface WritingStatsPanelProps {
  wordCountStats: WordCountStats;
  onClose?: () => void;
}

export function WritingStatsPanel({ wordCountStats, onClose }: WritingStatsPanelProps) {
  const { t } = useLocale();
  const { stats, getTodayWords, getWeekWords, resetSession } = useWritingStats();
  const todayWords = getTodayWords();
  const weekWords = getWeekWords();

  const handleReset = useCallback(() => {
    resetSession();
  }, [resetSession]);

  return (
    <div className="project-selector-overlay" onClick={onClose}>
      <div
        className="project-selector-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ minWidth: 320 }}
      >
        <h2
          style={{
            margin: '0 0 16px',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text-main)',
          }}
        >
          {t('writing.stats')}
        </h2>

        <div className="writing-stats-panel" style={{ borderTop: 'none', padding: 0 }}>
          <div className="writing-stats-row">
            <span className="writing-stats-label">{t('writing.sessionWords')}</span>
            <span>{stats.currentSessionWords}</span>
          </div>
          <div className="writing-stats-row">
            <span className="writing-stats-label">{t('writing.dailyTarget')}</span>
            <span>{todayWords}</span>
          </div>
          <div className="writing-stats-row">
            <span className="writing-stats-label">{t('writing.weeklyTarget')}</span>
            <span>{weekWords}</span>
          </div>
          <div className="writing-stats-row">
            <span className="writing-stats-label">{t('writing.totalWords')}</span>
            <span>{wordCountStats.approximateTextLength}</span>
          </div>
          <div className="writing-stats-row">
            <span className="writing-stats-label">{t('status.chineseWords')}</span>
            <span>{wordCountStats.chineseChars}</span>
          </div>
          <div className="writing-stats-row">
            <span className="writing-stats-label">{t('status.englishWords')}</span>
            <span>{wordCountStats.englishWords}</span>
          </div>
        </div>

        <div className="project-selector-actions">
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '7px 16px',
              borderRadius: 6,
              fontSize: 13,
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              marginRight: 'auto',
            }}
          >
            Reset session
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 16px',
              borderRadius: 6,
              fontSize: 13,
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t('confirm.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
