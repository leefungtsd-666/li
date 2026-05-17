import type { WordCountStats } from '../../writing/writingProjectTypes.ts';

interface StatusBarProps {
  wordCount: WordCountStats;
  isSourceMode: boolean;
  isTauri: boolean;
}

export function StatusBar({ wordCount, isSourceMode, isTauri }: StatusBarProps) {
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
    >
      <span>
        {wordCount.chineseChars} Chinese / {wordCount.englishWords} English words
      </span>
      <span>
        ~{wordCount.approximateTextLength} chars
      </span>
      <span style={{ marginLeft: 'auto' }}>
        {isSourceMode ? 'Source' : 'Render'}
      </span>
      {!isTauri && (
        <span style={{ color: 'var(--danger)', fontWeight: 500 }}>
          Browser mode - files disabled
        </span>
      )}
    </div>
  );
}
