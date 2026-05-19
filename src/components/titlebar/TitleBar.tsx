import { WindowControls } from './WindowControls.tsx';
import { useLocale } from '../../i18n/useLocale.ts';

interface TitleBarProps {
  fileName: string;
  isDirty: boolean;
  showOutline: boolean;
  isSourceMode: boolean;
  theme: 'light' | 'dark';
  onToggleOutline: () => void;
  onToggleSource: () => void;
  onToggleTheme: () => void;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSettings: () => void;
  autoSaveStatus?: 'idle' | 'saving' | 'saved';
  // Writing project
  projectName?: string;
  onProjectNew?: () => void;
  onProjectOpen?: () => void;
  onProjectClose?: () => void;
  // Focus mode
  onToggleFocusMode?: () => void;
}

export function TitleBar({
  fileName,
  isDirty,
  showOutline: _showOutline,
  isSourceMode,
  theme,
  onToggleOutline,
  onToggleSource,
  onToggleTheme,
  onNew,
  onOpen,
  onSave,
  onSettings,
  autoSaveStatus = 'idle',
  projectName,
  onProjectNew,
  onProjectOpen,
  onToggleFocusMode,
}: TitleBarProps) {
  const { t } = useLocale();

  return (
    <div className="titlebar" role="banner" aria-label={t('app.name')}>
      <div className="titlebar-controls" style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <button className="titlebar-btn" onClick={onNew} title={t('titlebar.new')} aria-label={t('titlebar.new')}>
          +
        </button>
        <button className="titlebar-btn" onClick={onOpen} title={t('titlebar.open')} aria-label={t('titlebar.open')}>
          &#x1F4C2;
        </button>
        <button className="titlebar-btn" onClick={onSave} title={t('titlebar.save')} aria-label={t('titlebar.save')}>
          &#x1F4BE;
        </button>
        {projectName !== undefined && (
          <>
            <span style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 4px', display: 'inline-block' }} />
            <button className="titlebar-btn" onClick={onProjectNew} title="New Project" aria-label="New Project" style={{ fontSize: 13 }}>
              P+
            </button>
            <button className="titlebar-btn" onClick={onProjectOpen} title="Open Project" aria-label="Open Project">
              P
            </button>
          </>
        )}
      </div>

      <div className="titlebar-title">
        {projectName && <span style={{ color: 'var(--accent)', marginRight: 6 }}>{projectName}</span>}
        <span>{fileName}</span>
        {isDirty && <span className="titlebar-dirty">&#x2022;</span>}
        {autoSaveStatus === 'saving' && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>{t('autosave.saving')}</span>}
      </div>

      <div className="titlebar-controls" style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onToggleFocusMode && (
          <button
            className="titlebar-btn"
            onClick={onToggleFocusMode}
            title={t('focusMode.toggle')}
            aria-label={t('focusMode.toggle')}
            style={{ fontSize: 13 }}
          >
            F
          </button>
        )}
        <button
          className="titlebar-btn"
          onClick={onToggleSource}
          title={isSourceMode ? t('titlebar.renderMode') : t('titlebar.sourceMode')}
          aria-label={isSourceMode ? t('titlebar.renderMode') : t('titlebar.sourceMode')}
        >
          {'</>'}
        </button>
        <button
          className="titlebar-btn"
          onClick={(e) => { e.stopPropagation(); onToggleOutline(); }}
          title={t('titlebar.outline')}
          aria-label={t('titlebar.outline')}
        >
          T
        </button>
        <button
          className="titlebar-btn"
          onClick={onToggleTheme}
          title={t('titlebar.theme')}
          aria-label={t('titlebar.theme')}
        >
          {theme === 'light' ? 'D' : 'L'}
        </button>
        <button
          className="titlebar-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSettings();
          }}
          title={t('titlebar.settings')}
          aria-label={t('titlebar.settings')}
        >
          ...
        </button>
        <WindowControls />
      </div>
    </div>
  );
}
