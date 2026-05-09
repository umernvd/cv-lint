'use client';

import React from 'react';

export interface SubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SubmitButton({
  children,
  loading = false,
  disabled = false,
  className = '',
}: SubmitButtonProps): React.JSX.Element {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      aria-busy={loading}
      className={`
        w-full rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground
        shadow-pop transition-all duration-300 ease-bounce
        hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover
        active:translate-x-0 active:translate-y-0 active:shadow-pop-active
        disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-pop
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Please wait...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
