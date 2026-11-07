import React from 'react';
import { AlertCircle } from 'lucide-react';

/** Kelas dasar semua input agar tinggi, ukuran teks, dan fokus seragam (56px untuk input formulir, 52px untuk pencarian). */
export function inputClass(hasError?: boolean, extra = '', size: 'md' | 'lg' = 'lg'): string {
  const minHeight = size === 'lg' ? 'min-h-[56px]' : 'min-h-[52px]';
  return `w-full ${minHeight} px-4 bg-surface border rounded-[8px] text-[17px] text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:bg-subtle disabled:text-ink-muted ${
    hasError ? 'border-danger ring-1 ring-danger/40' : 'border-line-field'
  } ${extra}`;
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  /** Info singkat yang benar-benar membantu (bukan pengganti label). */
  hint?: React.ReactNode;
  error?: string;
  children: (describedBy: string | undefined) => React.ReactNode;
  className?: string;
}

/**
 * Bungkus field: label di atas, penanda wajib/opsional konsisten,
 * hint & error terhubung ke input lewat aria-describedby.
 */
export function Field({ id, label, required, hint, error, children, className = '' }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-baseline gap-2 text-base font-semibold text-ink mb-2">
        <span>{label}</span>
        {required ? (
          <span className="text-sm font-semibold text-danger">wajib</span>
        ) : (
          <span className="text-sm font-normal text-ink-muted">(boleh dikosongkan)</span>
        )}
      </label>
      {children(describedBy)}
      {error && (
        <p id={errorId} className="mt-2 text-[15px] text-danger font-medium flex items-start gap-1.5" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0 mt-px" aria-hidden />
          <span>{error}</span>
        </p>
      )}
      {hint && (
        <p id={hintId} className="mt-2 text-[15px] text-ink-muted leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}

interface QtyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onValueChange: (v: string) => void;
  unit?: string;
  hasError?: boolean;
}

/** Input jumlah: hanya angka bulat, satuan terlihat jelas di kanan. */
export function QtyInput({ value, onValueChange, unit = 'pcs', hasError, className = '', ...rest }: QtyInputProps) {
  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        value={value}
        onChange={(e) => onValueChange(e.target.value.replace(/[^\d]/g, ''))}
        className={inputClass(hasError, `pr-16 font-semibold tabular-nums text-lg ${className}`)}
        {...rest}
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-semibold text-ink-muted pointer-events-none">
        {unit}
      </span>
    </div>
  );
}

/** Ringkasan kesalahan di atas form — tautan langsung ke field yang bermasalah. */
export function ErrorSummary({
  errors,
  labels,
  title = 'Data belum bisa disimpan. Mohon perbaiki:',
}: {
  errors: Record<string, string>;
  labels: Record<string, string>;
  title?: string;
}) {
  const entries = Object.entries(errors).filter(([, v]) => !!v);
  if (entries.length === 0) return null;
  return (
    <div
      className="p-4 rounded-card border-2 border-danger bg-danger-soft text-ink"
      role="alert"
      tabIndex={-1}
      id="ringkasan-kesalahan"
    >
      <p className="font-bold text-danger flex items-center gap-2 text-base">
        <AlertCircle className="w-5 h-5" aria-hidden />
        {title}
      </p>
      <ul className="mt-2 space-y-1.5 list-disc pl-6 text-[15px]">
        {entries.map(([key, msg]) => (
          <li key={key}>
            <a href={`#${key}`} className="underline text-danger font-medium" onClick={(e) => {
              e.preventDefault();
              document.getElementById(key)?.focus();
            }}>
              {labels[key] ? `${labels[key]}: ` : ''}
            </a>
            <span>{msg}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
