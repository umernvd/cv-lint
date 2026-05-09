'use client';

import React, { useState, useCallback } from 'react';

export type ValidationState = 'idle' | 'success' | 'error';

export interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  validationState?: ValidationState;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

export function FormField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  validationState = 'idle',
  autoComplete,
  required = false,
  disabled = false,
  id,
}: FormFieldProps): React.JSX.Element {
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;
  const hasError = validationState === 'error' && touched && error;
  const isSuccess = validationState === 'success' && touched && !error;
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${fieldId}-error`;

  const handleBlur = useCallback(() => {
    setTouched(true);
    onBlur?.();
  }, [onBlur]);

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const borderColorClass = hasError
    ? 'border-destructive focus:ring-destructive/30'
    : isSuccess
      ? 'border-success focus:ring-success/30'
      : 'border-border focus:ring-primary/30';

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          type={effectiveType}
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onBlur={handleBlur}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? errorId : undefined}
          className={`
            w-full rounded-lg border-2 border-border bg-white px-3 py-2.5 text-sm text-foreground
            placeholder:text-muted-foreground/50
            shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition-all duration-200
            focus:outline-none focus:ring-2 focus:shadow-pop
            disabled:opacity-50 disabled:cursor-not-allowed
            ${borderColorClass}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePassword}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-1 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {hasError && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
