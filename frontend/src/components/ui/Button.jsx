import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 focus:ring-red-500',
    secondary: 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 shadow-sm focus:ring-red-500',
    outline: 'bg-transparent hover:bg-red-50 text-red-600 border-2 border-red-200 focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-slate-50 text-slate-600 focus:ring-red-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 focus:ring-red-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 focus:ring-emerald-500',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs gap-1.5',
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2.5',
    lg: 'px-8 py-4 text-lg gap-3',
    xl: 'px-10 py-5 text-xl gap-4',
  };

  const classes = [
    baseClasses,
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    loading ? 'cursor-wait' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 size={size === 'xs' ? 14 : size === 'sm' ? 16 : size === 'lg' ? 20 : size === 'xl' ? 24 : 18} className="animate-spin" />
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon size={size === 'xs' ? 14 : size === 'sm' ? 16 : size === 'lg' ? 20 : size === 'xl' ? 24 : 18} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'xs' ? 14 : size === 'sm' ? 16 : size === 'lg' ? 20 : size === 'xl' ? 24 : 18} />}
    </button>
  );
};

export default Button;
