import { html } from '../services/html';
import { useState, useEffect } from 'preact/hooks';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let toasts: Toast[] = [];
let listeners: Array<() => void> = [];
let idCounter = 0;

function notify() {
  for (const fn of listeners) fn();
}

export function addToast(type: ToastType, message: string): string {
  const id = String(++idCounter);
  toasts = [...toasts, { id, type, message }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }, 3000);
  return id;
}

export function removeToast(id: string): void {
  toasts = toasts.filter(t => t.id !== id);
  notify();
}

export function useToasts() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const fn = () => forceUpdate(n => n + 1);
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  }, []);

  return { toasts, addToast, removeToast };
}

const COLORS: Record<ToastType, string> = {
  success: 'var(--success)',
  error: 'var(--error)',
  info: 'var(--accent)',
};

const BG_COLORS: Record<ToastType, string> = {
  success: 'rgba(16, 185, 129, 0.12)',
  error: 'rgba(239, 68, 68, 0.12)',
  info: 'rgba(129, 140, 248, 0.12)',
};

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✗',
  info: 'ℹ',
};

export function Toasts() {
  const { toasts: currentToasts, removeToast: rm } = useToasts();

  if (currentToasts.length === 0) return null;

  return html`
    <div style=${{
      position: 'fixed',
      bottom: 48,
      right: 16,
      zIndex: 300,
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: 8,
      pointerEvents: 'none',
      maxHeight: 'calc(100vh - 100px)',
      overflow: 'hidden',
    }}>
      ${currentToasts.map(toast => html`
        <div
          key=${toast.id}
          style=${{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            fontSize: 12,
            color: 'var(--text)',
            minWidth: 220,
            maxWidth: 380,
            pointerEvents: 'auto',
            animation: 'slide-in-right 300ms var(--ease-out) both',
          }}
        >
          <span style=${{
            width: 20, height: 20,
            borderRadius: '50%',
            background: BG_COLORS[toast.type],
            color: COLORS[toast.type],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0,
          }}>${ICONS[toast.type]}</span>
          <span style=${{ flex: 1, lineHeight: 1.4 }}>${toast.message}</span>
          <button
            onClick=${() => rm(toast.id)}
            style=${{
              width: 18, height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-subtle)',
              cursor: 'pointer',
              fontSize: 10,
              flexShrink: 0,
              transition: 'all 150ms var(--ease-smooth)',
              background: 'transparent',
              border: 'none',
            }}
            onMouseEnter=${(e: any) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave=${(e: any) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)'; }}
          >✕</button>
        </div>
      `)}
    </div>
  `;
}
