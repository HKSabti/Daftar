import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

type ToastListener = (toast: ToastItem) => void;
const listeners: Set<ToastListener> = new Set();

export function showToast(message: string, type: ToastType = 'info', duration = 3500) {
  const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const item: ToastItem = { id, message, type, duration };
  listeners.forEach(fn => fn(item));
}

export const toast = {
  success: (msg: string, dur?: number) => showToast(msg, 'success', dur),
  error: (msg: string, dur?: number) => showToast(msg, 'error', dur),
  info: (msg: string, dur?: number) => showToast(msg, 'info', dur),
  warning: (msg: string, dur?: number) => showToast(msg, 'warning', dur),
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleAdd = (item: ToastItem) => {
      setToasts(prev => [...prev, item]);
      if (item.duration && item.duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== item.id));
        }, item.duration);
      }
    };

    listeners.add(handleAdd);
    return () => {
      listeners.delete(handleAdd);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed z-9999 top-[max(0.75rem,env(safe-area-inset-top,0.75rem))] left-1/2 -translate-x-1/2 w-[92vw] max-w-md pointer-events-none flex flex-col gap-2 transition-all duration-300"
      dir="rtl"
    >
      {toasts.map(t => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-500/30 bg-white/95 shadow-emerald-500/10 text-emerald-950',
          error: 'border-rose-500/30 bg-white/95 shadow-rose-500/10 text-rose-950',
          warning: 'border-amber-500/30 bg-white/95 shadow-amber-500/10 text-amber-950',
          info: 'border-sky-500/30 bg-white/95 shadow-sky-500/10 text-sky-950',
        };

        return (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-xl text-sm font-medium transition-all duration-200 transform animate-in slide-in-from-top-4 fade-in cursor-pointer select-none active:scale-98 ${borders[t.type]}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {icons[t.type]}
              <p className="truncate text-xs sm:text-sm font-semibold leading-snug">{t.message}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(t.id);
              }}
              className="p-1 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
