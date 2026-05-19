import { useState, useCallback, useRef } from 'react';
import type { DocumentState } from './documentTypes.ts';
import { EMPTY_DOCUMENT } from './documentTypes.ts';
import { readFile, writeFile, showOpenDialog, showSaveDialog } from './fileSystem.ts';
import { isTauri } from '../utils/platform.ts';

let nextToken = 1;

export function useDocumentState(onError?: (message: string) => void) {
  const [doc, setDoc] = useState<DocumentState>(EMPTY_DOCUMENT);
  const confirmCallbackRef = useRef<(() => void) | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<'new' | 'open' | null>(null);

  const setContent = useCallback((content: string) => {
    setDoc((prev) => ({
      ...prev,
      content,
      isDirty: content !== prev.savedContent,
    }));
  }, []);

  const checkDirtyAndProceed = useCallback(
    (action: 'new' | 'open', callback: () => void) => {
      if (doc.isDirty) {
        confirmCallbackRef.current = callback;
        setPendingAction(action);
        setShowConfirm(true);
      } else {
        callback();
      }
    },
    [doc.isDirty],
  );

  const confirmProceed = useCallback(() => {
    setShowConfirm(false);
    if (confirmCallbackRef.current) {
      confirmCallbackRef.current();
      confirmCallbackRef.current = null;
    }
    setPendingAction(null);
  }, []);

  const cancelProceed = useCallback(() => {
    setShowConfirm(false);
    confirmCallbackRef.current = null;
    setPendingAction(null);
  }, []);

  const saveAsDocument = useCallback(async (): Promise<boolean> => {
    if (!isTauri) {
      onError?.('File operations are not available in browser preview mode.');
      return false;
    }
    try {
      const filePath = await showSaveDialog(doc.fileName);
      if (!filePath) return false;
      await writeFile(filePath, doc.content);
      const parts = filePath.replace(/\\/g, '/').split('/');
      const fileName = parts[parts.length - 1] || 'Untitled.md';
      setDoc((prev) => ({
        ...prev,
        filePath,
        fileName,
        savedContent: prev.content,
        isDirty: false,
        isLoading: false,
      }));
      return true;
    } catch (err) {
      onError?.('Failed to save file. Check permissions and try again.');
      return false;
    }
  }, [doc, onError]);

  const saveDocument = useCallback(async (): Promise<boolean> => {
    if (!isTauri) {
      onError?.('File operations are not available in browser preview mode.');
      return false;
    }
    try {
      if (doc.filePath) {
        await writeFile(doc.filePath, doc.content);
        setDoc((prev) => ({
          ...prev,
          savedContent: prev.content,
          isDirty: false,
        }));
        return true;
      }
      return await saveAsDocument();
    } catch (err) {
      onError?.('Failed to save file. Check permissions and try again.');
      return false;
    }
  }, [doc, saveAsDocument, onError]);

  const newDocument = useCallback(() => {
    checkDirtyAndProceed('new', () => {
      setDoc({
        ...EMPTY_DOCUMENT,
        fileToken: nextToken++,
      });
    });
  }, [checkDirtyAndProceed]);

  const openDocument = useCallback(async () => {
    if (!isTauri) {
      onError?.('File operations are not available in browser preview mode.');
      return;
    }

    const doOpen = async () => {
      try {
        const filePath = await showOpenDialog();
        if (!filePath) return;
        setDoc((prev) => ({ ...prev, isLoading: true }));
        const content = await readFile(filePath);
        const parts = filePath.replace(/\\/g, '/').split('/');
        const fileName = parts[parts.length - 1] || 'Untitled.md';
        setDoc({
          filePath,
          fileName,
          content,
          savedContent: content,
          isDirty: false,
          isLoading: false,
          fileToken: nextToken++,
        });
      } catch (err) {
        setDoc((prev) => ({ ...prev, isLoading: false }));
        onError?.('Could not open file. The file may not exist or is not a valid Markdown file.');
      }
    };

    if (doc.isDirty) {
      confirmCallbackRef.current = doOpen;
      setPendingAction('open');
      setShowConfirm(true);
    } else {
      await doOpen();
    }
  }, [doc.isDirty, onError]);

  // Open a file directly by path (bypasses dialog, used by drag-drop and recent files)
  const openDocumentAtPath = useCallback(async (filePath: string) => {
    try {
      setDoc((prev) => ({ ...prev, isLoading: true }));
      const content = await readFile(filePath);
      const parts = filePath.replace(/\\/g, '/').split('/');
      const fileName = parts[parts.length - 1] || 'Untitled.md';
      setDoc({
        filePath,
        fileName,
        content,
        savedContent: content,
        isDirty: false,
        isLoading: false,
        fileToken: nextToken++,
      });
    } catch (err) {
      setDoc((prev) => ({ ...prev, isLoading: false }));
      onError?.('Could not open file. The file may not exist or is not a valid Markdown file.');
    }
  }, [onError]);

  return {
    doc,
    setContent,
    newDocument,
    openDocument,
    openDocumentAtPath,
    saveDocument,
    saveAsDocument,
    showConfirm,
    pendingAction,
    confirmProceed,
    cancelProceed,
  };
}
