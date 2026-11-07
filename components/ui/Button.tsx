import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger' | 'success';
type Size = 'lg' | 'md' | 'sm';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong border border-brand hover:border-brand-strong shadow-sm hover:shadow active:bg-brand-strong',
  secondary: 'bg-surface text-navy border border-line-field hover:bg-subtle hover:border-navy/40 shadow-xs active:bg-canvas',
  quiet: 'bg-transparent text-brand border border-transparent hover:bg-brand-soft hover:text-brand-strong active:bg-brand-soft/80',
  danger: 'bg-danger text-white border border-danger hover:bg-danger/90 shadow-xs active:bg-danger',
  success: 'bg-success text-white border border-success hover:bg-success/90 shadow-xs active:bg-success',
};

const SIZE: Record<Size, string> = {
  lg: 'min-h-[52px] px-6 text-[17px]',
  md: 'min-h-[46px] px-4 text-base',
  sm: 'min-h-[40px] px-3.5 text-[15px]',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Teks saat loading, mis. "Menyimpan..." */
  loadingText?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    icon,
    iconRight,
    fullWidth,
    className = '',
    disabled,
    children,
    type = 'button',
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-field font-semibold leading-tight transition-all duration-150 active:scale-[0.985] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${VARIANT[variant]} ${SIZE[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...rest}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden /> : icon}
      <span>{loading && loadingText ? loadingText : children}</span>
      {!loading && iconRight}
    </button>
  );
});
