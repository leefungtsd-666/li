import { useLocale } from '../../i18n/useLocale.ts';

interface DropZoneProps {
  visible: boolean;
}

export function DropZone({ visible }: DropZoneProps) {
  const { t } = useLocale();

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(4px)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          padding: '32px 48px',
          borderRadius: 16,
          border: '2px dashed var(--accent)',
          background: 'var(--titlebar-bg)',
          color: 'var(--text-main)',
          fontSize: 16,
          fontWeight: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        {t('dropzone.hint')}
      </div>
    </div>
  );
}
