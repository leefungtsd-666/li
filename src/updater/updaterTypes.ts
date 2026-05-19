export type UpdateStatus =
  | { type: 'idle' }
  | { type: 'checking' }
  | { type: 'available'; version: string; body: string; date?: string }
  | { type: 'downloading'; progress: number }
  | { type: 'readyToInstall' }
  | { type: 'error'; message: string };
