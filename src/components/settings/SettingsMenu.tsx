import { useLocale } from '../../i18n/useLocale.ts';
import type { Locale } from '../../i18n/useLocale.ts';
import { useUpdater } from '../../updater/useUpdater.ts';

interface SettingsMenuProps {
  isOpen: boolean;
  theme: 'light' | 'dark';
  locale: Locale;
  onToggleTheme: () => void;
  onSetLocale: (locale: Locale) => void;
  onClose: () => void;
  onShowExport?: () => void;
}

export function SettingsMenu({ isOpen, theme, locale, onToggleTheme, onSetLocale, onShowExport }: SettingsMenuProps) {
  const { t } = useLocale();
  const { status, checkForUpdates } = useUpdater();

  if (!isOpen) return null;

  const statusLabel = (() => {
    switch (status.type) {
      case 'checking': return '...';
      case 'error': return status.message;
      case 'idle': return null;
      default: return null;
    }
  })();

  return (
    <div
      style={{
        position: 'fixed',
        top: 38,
        right: 8,
        background: 'var(--titlebar-bg)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        zIndex: 1000,
        minWidth: 180,
        padding: '6px 0',
      }}
      onClick={(e) => e.stopPropagation()}
      role="menu"
      aria-label={t('titlebar.settings')}
    >
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '8px 16px',
          fontSize: 13,
          color: 'var(--text-main)',
          textAlign: 'left',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--button-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        onClick={onToggleTheme}
      >
        {theme === 'light' ? t('settings.darkMode') : t('settings.lightMode')}
      </button>
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 12px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px', fontSize: 13 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{t('settings.language')}:</span>
        <button
          style={{
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 12,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            background: locale === 'zh-CN' ? 'var(--accent)' : 'transparent',
            color: locale === 'zh-CN' ? '#fff' : 'var(--text-main)',
          }}
          onClick={() => onSetLocale('zh-CN')}
        >
          中文
        </button>
        <button
          style={{
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 12,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            background: locale === 'en' ? 'var(--accent)' : 'transparent',
            color: locale === 'en' ? '#fff' : 'var(--text-main)',
          }}
          onClick={() => onSetLocale('en')}
        >
          EN
        </button>
      </div>
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 12px' }} />
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '8px 16px',
          fontSize: 13,
          color: 'var(--text-main)',
          textAlign: 'left',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--button-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        onClick={checkForUpdates}
      >
        {t('settings.checkUpdate')}{statusLabel && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{statusLabel}</span>}
      </button>
      {onShowExport && (
        <>
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 12px' }} />
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '8px 16px',
              fontSize: 13,
              color: 'var(--text-main)',
              textAlign: 'left',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--button-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            onClick={onShowExport}
          >
            {t('writing.export')}
          </button>
        </>
      )}
      <div style={{ padding: '8px 16px', fontSize: 11, color: 'var(--text-muted)' }}>
        li v0.1.0
      </div>
    </div>
  );
}
