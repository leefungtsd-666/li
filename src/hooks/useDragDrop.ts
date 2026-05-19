import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDragDropOptions {
  onFilesDropped: (filePaths: string[]) => void;
}

/**
 * Handles drag-and-drop of .md/.markdown files onto the editor window.
 * In Tauri mode, dropped files include a .path property from the Chromium webview.
 * In browser mode, files are detected but paths are not available.
 */
export function useDragDrop({ onFilesDropped }: UseDragDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer?.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      const paths: string[] = [];

      if (e.dataTransfer?.files) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i];
          if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
            // In Tauri/Chromium, File has a .path property with the full path
            const path = (file as File & { path?: string }).path || file.name;
            paths.push(path);
          }
        }
      }

      if (paths.length > 0) {
        onFilesDropped(paths);
      }
    },
    [onFilesDropped],
  );

  useEffect(() => {
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

  return { isDragging };
}
