import { WindowControls } from './WindowControls.tsx';

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
}: TitleBarProps) {
  return (
    <div className="titlebar">
      <div className="titlebar-controls" style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <button className="titlebar-btn" onClick={onNew} title="New (Ctrl+N)">
          +
        </button>
        <button className="titlebar-btn" onClick={onOpen} title="Open (Ctrl+O)">
          &#x1F4C2;
        </button>
        <button className="titlebar-btn" onClick={onSave} title="Save (Ctrl+S)">
          &#x1F4BE;
        </button>
      </div>

      <div className="titlebar-title">
        <span>{fileName}</span>
        {isDirty && <span className="titlebar-dirty">&#x2022;</span>}
      </div>

      <div className="titlebar-controls" style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <button
          className="titlebar-btn"
          onClick={onToggleSource}
          title={isSourceMode ? 'Render mode' : 'Source mode'}
        >
          {'</>'}
        </button>
        <button
          className="titlebar-btn"
          onClick={(e) => { e.stopPropagation(); onToggleOutline(); }}
          title="Toggle outline (Ctrl+Shift+O)"
        >
          T
        </button>
        <button className="titlebar-btn" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'light' ? 'D' : 'L'}
        </button>
        <button
          className="titlebar-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSettings();
          }}
          title="Settings"
        >
          ...
        </button>
        <WindowControls />
      </div>
    </div>
  );
}
