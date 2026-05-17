interface SettingsMenuProps {
  isOpen: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onClose: () => void;
}

export function SettingsMenu({ isOpen, theme, onToggleTheme }: SettingsMenuProps) {
  if (!isOpen) return null;

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
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </button>
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 12px' }} />
      <div style={{ padding: '8px 16px', fontSize: 11, color: 'var(--text-muted)' }}>
        li v0.1.0
      </div>
    </div>
  );
}
