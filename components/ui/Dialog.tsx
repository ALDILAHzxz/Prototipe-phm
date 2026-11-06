import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  onClose: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Jangan tutup saat klik latar (untuk dialog yang sedang menyimpan). */
  dismissible?: boolean;
  size?: 'md' | 'lg';
}

/**
 * Dialog modal yang aksesibel: role="dialog", fokus otomatis, Esc untuk menutup,
 * fokus dikunci di dalam dialog, dan dikembalikan ke elemen sebelumnya.
 */
export function Dialog({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  dismissible = true,
  size = 'md',
}: DialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement;
    const panel = panelRef.current;
    const focusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
    // Fokus ke elemen yang ditandai data-autofocus, atau elemen pertama.
    const preferred = panel?.querySelector<HTMLElement>('[data-autofocus]');
    (preferred ?? focusable()[0] ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === 'Tab') {
        const items = focusable();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      lastFocused.current?.focus?.();
    };
  }, [open, dismissible]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-ink/60"
        aria-hidden
        onClick={() => dismissible && onClose()}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative w-full ${
          size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg'
        } max-h-[92vh] overflow-y-auto bg-surface rounded-t-2xl sm:rounded-card shadow-2xl border border-line`}
      >
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-line">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-ink leading-snug">
              {title}
            </h2>
            {description && (
              <div id={descId} className="mt-1 text-base text-ink-muted">
                {description}
              </div>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 min-h-[44px] px-3 rounded-field text-ink-muted hover:bg-subtle flex items-center gap-1 text-[15px] font-medium cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden />
              <span>Tutup</span>
            </button>
          )}
        </div>
        {children && <div className="p-5 sm:p-6">{children}</div>}
        {footer && (
          <div className="p-5 sm:p-6 pt-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
