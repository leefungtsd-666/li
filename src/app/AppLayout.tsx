import type { ReactNode } from 'react';

interface AppLayoutProps {
  titlebar: ReactNode;
  editor: ReactNode;
  outline: ReactNode | null;
  statusbar: ReactNode;
}

export function AppLayout({ titlebar, editor, outline, statusbar }: AppLayoutProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--app-bg)',
      }}
    >
      {titlebar}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {editor}
        </div>
        {outline}
      </div>
      {statusbar}
    </div>
  );
}
