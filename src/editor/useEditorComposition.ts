import { useRef, useCallback } from 'react';
import { DEBUG_INPUT } from '../utils/debugFlags.ts';

export function useEditorComposition() {
  const isComposingRef = useRef(false);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
    if (DEBUG_INPUT) console.log('[IME] compositionStart');
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    if (DEBUG_INPUT) console.log('[IME] compositionEnd');
  }, []);

  const isComposing = useCallback(() => {
    return isComposingRef.current;
  }, []);

  const preventDuringComposition = useCallback(
    (e: KeyboardEvent): boolean => {
      if (isComposingRef.current) {
        if (DEBUG_INPUT) console.log('[IME] Blocked during composition:', e.key);
        return true;
      }
      if (e.isComposing) {
        if (DEBUG_INPUT) console.log('[IME] Blocked (isComposing):', e.key);
        return true;
      }
      if (e.key === 'Process') {
        if (DEBUG_INPUT) console.log('[IME] Blocked (Process key):', e.key);
        return true;
      }
      if (e.keyCode === 229) {
        if (DEBUG_INPUT) console.log('[IME] Blocked (keyCode 229):', e.key);
        return true;
      }
      return false;
    },
    [],
  );

  return {
    isComposingRef,
    handleCompositionStart,
    handleCompositionEnd,
    isComposing,
    preventDuringComposition,
  };
}
