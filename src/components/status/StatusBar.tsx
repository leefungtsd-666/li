import type { WordCountStats } from '../../writing/writingProjectTypes.ts';
import { useLocale } from '../../i18n/useLocale.ts';

interface StatusBarProps {
  wordCount: WordCountStats;
  isSourceMode: boolean;
  isTauri: boolean;
  projectName?: string;
}

export function StatusBar({ wordCount, isSourceMode, isTauri, projectName }: StatusBarProps) {
  const { t } = useLocale();

  return (
    <div
      style={{
        height: 24,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        fontSize: 11,
        color: 'var(--text-muted)',
        flexShrink: 0,
        gap: 16,
        userSelect: 'none',
      }}
      role="status"
      aria-live="polite"
    >
      {projectName && (
        <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
          {projectName}
        </span>
      )}
      <span>
        {wordCount.chineseChars} {t('status.chineseWords')} / {wordCount.englishWords} {t('status.englishWords')}
      </span>
      <span>
        ~{wordCount.approximateTextLength} {t('status.chars')}
      </span>
      <span style={{ marginLeft: 'auto' }}>
        {isSourceMode ? t('status.mode.source') : t('status.mode.render')}
      </span>
      {!isTauri && (
        <span style={{ color: 'var(--danger)', fontWeight: 500 }}>
          {t('status.browserMode')}
        </span>
      )}
    </div>
  );
}
