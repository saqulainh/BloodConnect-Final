import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [inputType, setInputType] = React.useState(type);

  React.useEffect(() => {
    if (type === 'password') {
      setInputType(showPassword ? 'text' : 'password');
    } else {
      setInputType(type);
    }
  }, [type, showPassword]);

  const baseClasses = 'flex items-center gap-3 px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed';

  const inputClasses = [
    baseClasses,
    error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300',
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={inputClasses}>
        {Icon && iconPosition === 'left' && (
          <Icon size={20} className="text-slate-400 flex-shrink-0" />
        )}

        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {Icon && iconPosition === 'right' && !type === 'password' && (
          <Icon size={20} className="text-slate-400 flex-shrink-0" />
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-slate-500 font-medium">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
