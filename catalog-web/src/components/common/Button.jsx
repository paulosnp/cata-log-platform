import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'gradient-primary text-on-primary shadow-ambient hover:shadow-hover hover:scale-[1.02] active:scale-[0.98]',
    secondary:
      'bg-surface-container-lowest border border-outline-variant/20 text-on-surface hover:bg-surface-container hover:shadow-ambient active:scale-[0.98]',
    ghost:
      'text-primary hover:bg-surface-container-low active:bg-surface-container',
    danger:
      'bg-tertiary text-on-tertiary hover:bg-tertiary/90 shadow-ambient active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-5 py-2.5 text-sm rounded-md',
    lg: 'px-8 py-3.5 text-sm rounded-md',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
    </button>
  );
}
