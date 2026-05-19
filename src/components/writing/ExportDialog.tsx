import { useCallback, useState, type FormEvent } from 'react';
import type { Chapter } from '../../writing/writingProjectTypes.ts';
import type { ExportFormat, ExportOptions } from '../../writing/exportUtils.ts';
import { exportProject } from '../../writing/exportUtils.ts';
import { useLocale } from '../../i18n/useLocale.ts';

interface ExportDialogProps {
  isOpen: boolean;
  projectDir: string;
  projectTitle: string;
  author: string;
  chapters: Chapter[];
  onClose: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

const FORMATS: { key: ExportFormat; label: string; description: string }[] = [
  { key: 'md', label: 'Markdown', description: 'Plain text .md file' },
  { key: 'html', label: 'HTML', description: 'Styled .html file' },
  { key: 'pdf', label: 'PDF', description: 'Print dialog → Save as PDF' },
  { key: 'docx', label: 'DOCX', description: 'Coming soon' },
];

export function ExportDialog({
  isOpen,
  projectDir,
  projectTitle,
  author,
  chapters,
  onClose,
  onError,
  onSuccess,
}: ExportDialogProps) {
  const { t } = useLocale();
  const [format, setFormat] = useState<ExportFormat>('md');
  const [includeTitlePage, setIncludeTitlePage] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (chapters.length === 0) {
        onError('No chapters to export');
        return;
      }

      setIsExporting(true);
      try {
        const options: ExportOptions = {
          format,
          projectDir,
          projectTitle,
          author,
          chapters,
          includeTitlePage,
        };
        await exportProject(options);
        onSuccess(`Exported as ${format.toUpperCase()}`);
        onClose();
      } catch (err) {
        onError(err instanceof Error ? err.message : `Export failed`);
      } finally {
        setIsExporting(false);
      }
    },
    [format, includeTitlePage, projectDir, projectTitle, author, chapters, onClose, onError, onSuccess],
  );

  if (!isOpen) return null;

  return (
    <div className="project-selector-overlay" onClick={onClose}>
      <div
        className="project-selector-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ minWidth: 360 }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>
          {t('writing.export')}
        </h2>

        <form onSubmit={handleExport}>
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginBottom: 6,
              }}
            >
              Format
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {FORMATS.map((f) => {
                const isDisabled = f.key === 'docx';
                return (
                  <button
                    key={f.key}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setFormat(f.key)}
                    title={f.description}
                    style={{
                      flex: 1,
                      minWidth: 70,
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 13,
                      opacity: isDisabled ? 0.5 : 1,
                      background:
                        format === f.key
                          ? 'var(--accent)'
                          : 'var(--button-hover)',
                      color: format === f.key ? '#fff' : 'var(--text-main)',
                      border: 'none',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={includeTitlePage}
                onChange={(e) => setIncludeTitlePage(e.target.checked)}
              />
              Include title page
            </label>
          </div>

          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              marginBottom: 12,
            }}
          >
            Exporting {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
          </div>

          <div className="project-selector-actions">
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 16px',
                borderRadius: 6,
                fontSize: 13,
                background: 'var(--button-hover)',
                color: 'var(--text-main)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t('confirm.cancel')}
            </button>
            <button
              type="submit"
              disabled={isExporting || chapters.length === 0}
              style={{
                padding: '7px 16px',
                borderRadius: 6,
                fontSize: 13,
                background:
                  isExporting || chapters.length === 0
                    ? 'var(--border-subtle)'
                    : 'var(--accent)',
                color: '#fff',
                border: 'none',
                cursor:
                  isExporting || chapters.length === 0
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {isExporting ? 'Exporting...' : t('writing.export')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
