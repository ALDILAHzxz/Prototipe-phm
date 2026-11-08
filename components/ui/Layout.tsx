import React from 'react';
import { ArrowLeft, Info, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

/** Judul halaman yang konsisten: tombol kembali (opsional), judul, deskripsi, aksi utama. */
export function PageHeader({
  title,
  description,
  onBack,
  backLabel = 'Kembali',
  actions,
  meta,
}: {
  title: string;
  description?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 min-h-[40px] rounded-field text-[15px] font-semibold bg-surface border border-line text-navy dark:text-[#8CCBFF] hover:bg-subtle hover:border-brand/40 shadow-xs transition-all active:scale-[0.985] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden />
            {backLabel}
          </button>
        )}
        <h1 className="text-[28px] md:text-[32px] font-bold text-ink leading-tight">{title}</h1>
        {description && <p className="mt-2 text-base md:text-lg text-ink-muted max-w-3xl">{description}</p>}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-col sm:flex-row gap-3 shrink-0">{actions}</div>}
    </header>
  );
}

/** Kartu pengelompok informasi yang berkaitan. */
export function Card({
  title,
  description,
  actions,
  children,
  className = '',
  as: Tag = 'section',
}: {
  title?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  as?: 'section' | 'div';
}) {
  return (
    <Tag className={`bg-surface border border-line rounded-card shadow-card p-5 md:p-6 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
          <div>
            {title && <h2 className="text-xl md:text-[22px] font-bold text-ink leading-snug">{title}</h2>}
            {description && <p className="mt-1 text-[15px] md:text-base text-ink-muted">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </Tag>
  );
}

type Tone = 'info' | 'warning' | 'danger' | 'success';

/** Pesan penting yang menetap di layar (bukan toast yang hilang sendiri). */
export function Notice({
  tone = 'info',
  title,
  children,
  className = '',
  role,
}: {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  role?: 'alert' | 'status';
}) {
  const map: Record<Tone, { cls: string; icon: React.ReactNode }> = {
    info: { cls: 'bg-info-soft border-info/40 text-ink', icon: <Info className="w-5 h-5 text-info" aria-hidden /> },
    warning: {
      cls: 'bg-warning-soft border-warning/50 text-ink',
      icon: <AlertTriangle className="w-5 h-5 text-warning" aria-hidden />,
    },
    danger: {
      cls: 'bg-danger-soft border-danger/50 text-ink',
      icon: <AlertCircle className="w-5 h-5 text-danger" aria-hidden />,
    },
    success: {
      cls: 'bg-success-soft border-success/50 text-ink',
      icon: <CheckCircle2 className="w-5 h-5 text-success" aria-hidden />,
    },
  };
  const m = map[tone];
  return (
    <div className={`flex gap-3 p-4 rounded-card border ${m.cls} ${className}`} role={role}>
      <div className="shrink-0 mt-0.5">{m.icon}</div>
      <div className="text-[15px] md:text-base leading-relaxed min-w-0">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={title ? 'mt-1' : ''}>{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="text-center py-10 px-4">
      {icon && <div className="mx-auto mb-3 w-12 h-12 flex items-center justify-center text-ink-muted">{icon}</div>}
      <p className="text-lg font-bold text-ink">{title}</p>
      {description && <p className="mt-1 text-base text-ink-muted max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/** Pasangan label–nilai untuk ringkasan data (bukan untuk input). */
export function KeyValue({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className={`mt-0.5 text-ink break-words ${emphasis ? 'text-lg font-bold tabular-nums' : 'text-base font-semibold'}`}>
        {value}
      </dd>
    </div>
  );
}

export function ProgressBar({
  value,
  label,
  tone = 'brand',
}: {
  value: number;
  label: string;
  tone?: 'brand' | 'success' | 'navy';
}) {
  const color = tone === 'success' ? 'bg-success' : tone === 'navy' ? 'bg-navy' : 'bg-brand';
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className="h-3.5 w-full rounded-full bg-line overflow-hidden p-0.5"
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`h-full ${color} rounded-full transition-all duration-300 ease-out`} style={{ width: `${v}%` }} />
    </div>
  );
}

/** Pilihan filter berbentuk tombol (bukan dropdown) agar terlihat semua. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.id)}
            className={`min-h-[44px] px-4 rounded-field border text-[15px] font-semibold cursor-pointer transition-all duration-150 active:scale-[0.985] shadow-xs ${
              active
                ? 'bg-navy dark:bg-brand text-white dark:text-[#0B111B] border-navy dark:border-brand shadow-sm font-bold'
                : 'bg-surface text-ink border-line hover:bg-subtle hover:border-brand/40'
            }`}
          >
            {o.label}
            {typeof o.count === 'number' && (
              <span className={`ml-2 tabular-nums font-bold ${active ? 'text-white/90' : 'text-ink-muted'}`}>({o.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
