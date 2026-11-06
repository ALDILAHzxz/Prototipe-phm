import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger' | 'success';
type Size = 'lg' | 'md';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong border border-brand hover:border-brand-strong',
  secondary: 'bg-surface text-navy border border-line-field hover:bg-subtle',
  quiet: 'bg-transparent text-brand border border-transparent hover:bg-brand-soft underline-offset-4',
  danger: 'bg-danger text-white border border-danger hover:opacity-90',
  success: 'bg-success text-white border border-success hover:opacity-90',
};

const SIZE: Record<Size, string> = {
  lg: 'min-h-[52px] px-6 text-[17px]',
  md: 'min-h-[46px] px-4 text-base',
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
      className={`inline-flex items-center justify-center gap-2 rounded-field font-semibold leading-tight transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT[variant]} ${SIZE[size]} ${
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
