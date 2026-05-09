import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-on-surface-variant">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              error ? 'text-tertiary' : 'text-outline'
            }`}
          />
        )}

        <input
          type={inputType}
          className={`w-full rounded-md bg-surface-container-low py-3 text-sm text-on-surface placeholder:text-outline transition-all focus:bg-surface-container-lowest focus:shadow-ambient focus:outline-none ${
            Icon ? 'pl-10' : 'pl-4'
          } ${isPassword ? 'pr-10' : 'pr-4'} ${
            error
              ? 'ring-1 ring-tertiary focus:ring-2 focus:ring-tertiary'
              : 'focus:ring-1 focus:ring-primary/30'
          }`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-tertiary">{error}</p>
      )}
    </div>
  );
}
