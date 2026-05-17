import { getCurrentWindow } from '@tauri-apps/api/window';
import { isTauri } from '../../utils/platform.ts';

async function handleMinimize() {
  try {
    await getCurrentWindow().minimize();
  } catch (e) {
    console.error('minimize failed:', e);
  }
}

async function handleMaximize() {
  try {
    await getCurrentWindow().toggleMaximize();
  } catch (e) {
    console.error('maximize failed:', e);
  }
}

async function handleClose() {
  try {
    await getCurrentWindow().close();
  } catch (e) {
    console.error('close failed:', e);
  }
}

export function WindowControls() {
  if (!isTauri) return null;

  return (
    <div className="titlebar-controls" style={{ gap: 0 }}>
      <button
        className="titlebar-btn"
        onClick={handleMinimize}
        title="Minimize"
        aria-label="Minimize"
      >
        &#x2014;
      </button>
      <button
        className="titlebar-btn"
        onClick={handleMaximize}
        title="Maximize"
        aria-label="Maximize"
      >
        &#x25A1;
      </button>
      <button
        className="titlebar-btn titlebar-btn-close"
        onClick={handleClose}
        title="Close"
        aria-label="Close"
      >
        &#x2715;
      </button>
    </div>
  );
}
