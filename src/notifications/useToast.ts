import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ToastMessage, ToastType } from './notificationTypes.ts';

let nextToastId = 0;

export interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (type: ToastType, message: string, duration?: number) => string;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback for contexts where ToastProvider is not set (e.g. during testing)
    return {
      toasts: [],
      addToast: () => '',
      removeToast: () => {},
    };
  }
  return ctx;
}

export function useToastState() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000): string => {
      const id = `toast-${++nextToastId}`;
      const toast: ToastMessage = { id, type, message, duration };
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          removeToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [removeToast],
  );

  return { toasts, addToast, removeToast };
}
