import { useLocale } from '../../i18n/useLocale.ts';
import type { WordCountTarget, WordCountStats } from '../../writing/writingProjectTypes.ts';

interface WordCountProgressProps {
  wordCountStats: WordCountStats;
  wordCountTarget: WordCountTarget;
  onSetTarget: (target: WordCountTarget) => void;
}

export function WordCountProgress({
  wordCountStats,
  wordCountTarget,
}: WordCountProgressProps) {
  const { t } = useLocale();
  const total = wordCountStats.approximateTextLength;
  const dailyPct = wordCountTarget.daily > 0 ? Math.min(100, (total / wordCountTarget.daily) * 100) : 0;
  const projectPct = wordCountTarget.project > 0 ? Math.min(100, (total / wordCountTarget.project) * 100) : 0;

  return (
    <div className="wordcount-progress">
      <div className="wordcount-progress-row">
        <span>{t('writing.dailyTarget')}</span>
        <span>
          {total}/{wordCountTarget.daily}
        </span>
      </div>
      <div className="wordcount-progress-bar">
        <div
          className="wordcount-progress-fill"
          style={{ width: `${dailyPct}%` }}
        />
      </div>

      <div
        className="wordcount-progress-row"
        style={{ marginTop: 8 }}
      >
        <span>{t('writing.projectTarget')}</span>
        <span>
          {total}/{wordCountTarget.project}
        </span>
      </div>
      <div className="wordcount-progress-bar">
        <div
          className="wordcount-progress-fill"
          style={{ width: `${projectPct}%` }}
        />
      </div>
    </div>
  );
}
