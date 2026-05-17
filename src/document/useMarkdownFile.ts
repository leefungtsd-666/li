import { useCallback, useState } from 'react';
import type { DocumentState } from '../document/documentTypes.ts';
import { readFile, writeFile, showOpenDialog, showSaveDialog } from './fileSystem.ts';
import { isTauri } from '../utils/platform.ts';

export function useMarkdownFile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(async (): Promise<Partial<DocumentState> | null> => {
    if (!isTauri) {
      setError('File operations require Tauri desktop mode');
      return null;
    }
    setIsLoading(true);
    setError(null);
    try {
      const filePath = await showOpenDialog();
      if (!filePath) {
        setIsLoading(false);
        return null;
      }
      const content = await readFile(filePath);
      const parts = filePath.replace(/\\/g, '/').split('/');
      const fileName = parts[parts.length - 1] || 'Untitled.md';
      setIsLoading(false);
      return { filePath, fileName, content, savedContent: content, isDirty: false };
    } catch (err) {
      setError(String(err));
      setIsLoading(false);
      return null;
    }
  }, []);

  const save = useCallback(
    async (path: string, content: string): Promise<boolean> => {
      if (!isTauri) {
        setError('File operations require Tauri desktop mode');
        return false;
      }
      setIsLoading(true);
      setError(null);
      try {
        await writeFile(path, content);
        setIsLoading(false);
        return true;
      } catch (err) {
        setError(String(err));
        setIsLoading(false);
        return false;
      }
    },
    [],
  );

  const saveAs = useCallback(
    async (content: string, defaultName: string): Promise<string | null> => {
      if (!isTauri) {
        setError('File operations require Tauri desktop mode');
        return null;
      }
      setIsLoading(true);
      setError(null);
      try {
        const filePath = await showSaveDialog(defaultName);
        if (!filePath) {
          setIsLoading(false);
          return null;
        }
        await writeFile(filePath, content);
        setIsLoading(false);
        return filePath;
      } catch (err) {
        setError(String(err));
        setIsLoading(false);
        return null;
      }
    },
    [],
  );

  return { open, save, saveAs, isLoading, error, clearError: () => setError(null) };
}
