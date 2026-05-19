import { type FormEvent, useCallback, useState } from 'react';
import type { RecentProjectEntry } from '../../writing/writingProjectTypes.ts';
import { useLocale } from '../../i18n/useLocale.ts';

interface ProjectSelectorProps {
  isOpen: boolean;
  recentProjects: RecentProjectEntry[];
  onNewProject: (projectDir: string, title: string, author: string, description: string) => void;
  onOpenProject: () => void;
  onOpenRecent: (projectDir: string) => void;
  onClose: () => void;
}

export function ProjectSelector({
  isOpen,
  recentProjects,
  onNewProject,
  onOpenProject,
  onOpenRecent,
  onClose,
}: ProjectSelectorProps) {
  const { t } = useLocale();
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      // Use Tauri dialog to pick parent directory, then create project dir inside
      // For now, we need the projectDir from the dialog
      onNewProject('', title.trim(), author.trim(), description.trim());
    },
    [title, author, description, onNewProject],
  );

  if (!isOpen) return null;

  return (
    <div className="project-selector-overlay" onClick={onClose}>
      <div className="project-selector-dialog" onClick={(e) => e.stopPropagation()}>
        {mode === 'select' ? (
          <>
            <h2>{t('writing.title')}</h2>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                className="project-selector-btn"
                onClick={() => setMode('create')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 6,
                  fontSize: 13,
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {t('writing.newProject')}
              </button>
              <button
                className="project-selector-btn"
                onClick={onOpenProject}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 6,
                  fontSize: 13,
                  background: 'var(--button-hover)',
                  color: 'var(--text-main)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {t('writing.openProject')}
              </button>
            </div>

            {recentProjects.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {t('writing.recentProjects')}
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {recentProjects.map((p) => (
                    <div
                      key={p.projectDir}
                      className="writing-list-item"
                      onClick={() => onOpenRecent(p.projectDir)}
                    >
                      <span className="writing-list-item-title">{p.title}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="project-selector-actions">
              <button
                className="project-selector-btn"
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
            </div>
          </>
        ) : (
          <form onSubmit={handleCreate}>
            <h2>{t('writing.newProject')}</h2>

            <div className="project-selector-field">
              <label>{t('writing.projectTitle')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="project-selector-field">
              <label>{t('writing.author')}</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div className="project-selector-field">
              <label>{t('writing.description')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="project-selector-actions">
              <button
                type="button"
                className="project-selector-btn"
                onClick={() => setMode('select')}
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
                className="project-selector-btn"
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
                {t('writing.newProject')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
