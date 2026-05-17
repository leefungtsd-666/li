import { useRef, useCallback } from 'react';
import type { EditorController } from './editorTypes.ts';

export function useEditorController() {
  const controllerRef = useRef<EditorController | null>(null);

  const registerController = useCallback((controller: EditorController | null) => {
    controllerRef.current = controller;
  }, []);

  const getContent = useCallback((): string => {
    return controllerRef.current?.getContent() ?? '';
  }, []);

  const setContent = useCallback((content: string) => {
    controllerRef.current?.setContent(content);
  }, []);

  const selectAll = useCallback(() => {
    controllerRef.current?.selectAll();
  }, []);

  const focus = useCallback(() => {
    controllerRef.current?.focus();
  }, []);

  return {
    controllerRef,
    registerController,
    getContent,
    setContent,
    selectAll,
    focus,
  };
}
