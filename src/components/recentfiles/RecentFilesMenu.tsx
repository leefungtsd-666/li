import { useLocale } from '../../i18n/useLocale.ts';
import type { RecentFileEntry } from '../../document/useRecentFiles.ts';

interface RecentFilesMenuProps {
  items: RecentFileEntry[];
  onOpen: (filePath: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function RecentFilesMenu({ items, onOpen, onClear, onClose }: RecentFilesMenuProps) {
  const { t } = useLocale();

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: 2,
        background: 'var(--titlebar-bg)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        zIndex: 1000,
        minWidth: 200,
        maxWidth: 280,
        padding: '6px 0',
      }}
      onClick={(e) => e.stopPropagation()}
      role="menu"
      aria-label={t('recentFiles.title')}
    >
      <div style={{ padding: '6px 16px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
        {t('recentFiles.title')}
      </div>
      {items.length === 0 ? (
        <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
          {t('recentFiles.empty')}
        </div>
      ) : (
        items.map((item) => (
          <button
            key={item.filePath}
            style={{
              display: 'block',
              width: '100%',
              padding: '6px 16px',
              fontSize: 12,
              color: 'var(--text-main)',
              textAlign: 'left',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--button-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            onClick={() => {
              onOpen(item.filePath);
              onClose();
            }}
          >
            {item.fileName}
            <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-muted)' }}>
              {item.filePath}
            </span>
          </button>
        ))
      )}
      {items.length > 0 && (
        <>
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 12px' }} />
          <button
            style={{
              display: 'block',
              width: '100%',
              padding: '6px 16px',
              fontSize: 12,
              color: 'var(--text-muted)',
              textAlign: 'left',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--button-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            onClick={() => {
              onClear();
              onClose();
            }}
          >
            {t('recentFiles.clear')}
          </button>
        </>
      )}
    </div>
  );
}
