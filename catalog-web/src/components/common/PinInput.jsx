import { useRef, useEffect } from 'react';

export default function PinInput({
  length = 6,
  value = '',
  onChange,
  error = false,
  disabled = false,
}) {
  const inputsRef = useRef([]);

  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const focusInput = (index) => {
    if (inputsRef.current[index]) {
      inputsRef.current[index].focus();
      inputsRef.current[index].select();
    }
  };

  const handleChange = (e, index) => {
    const val = e.target.value;

    if (val && !/^\d$/.test(val)) return;

    const newDigits = [...digits];
    newDigits[index] = val;
    const newPin = newDigits.join('');
    onChange(newPin);

    if (val && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        focusInput(index - 1);
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

    if (pastedData.length > 0) {
      onChange(pastedData);
      const focusIdx = Math.min(pastedData.length, length) - 1;
      setTimeout(() => focusInput(focusIdx), 0);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          aria-label={`Dígito ${index + 1} de ${length}`}
          className={`
            h-12 w-12 rounded-lg border-2 bg-surface-container-lowest
            text-center font-mono text-xl font-bold text-on-surface
            transition-all duration-200 outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-tertiary animate-shake'
              : digit
                ? 'border-primary/50 bg-primary-fixed/20'
                : 'border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/20'
            }
          `}
        />
      ))}
    </div>
  );
}
