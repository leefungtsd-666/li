import { useToast } from '../../notifications/useToast.ts';
import type { ToastType } from '../../notifications/notificationTypes.ts';

const toastIcons: Record<ToastType, string> = {
  info: '\u2139\uFE0F',
  success: '\u2705',
  warning: '\u26A0\uFE0F',
  error: '\u274C',
};

const toastBg: Record<ToastType, string> = {
  info: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

const styles = {
  container: {
    position: 'fixed' as const,
    bottom: 48,
    right: 16,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
    pointerEvents: 'none' as const,
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 13,
    color: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    pointerEvents: 'auto' as const,
    cursor: 'pointer',
    maxWidth: 360,
    animation: 'toastIn 0.25s ease-out',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div
        style={styles.container}
        role="alert"
        aria-live="assertive"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{ ...styles.toast, background: toastBg[t.type] }}
            onClick={() => removeToast(t.id)}
            title="Click to dismiss"
          >
            <span>{toastIcons[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}
