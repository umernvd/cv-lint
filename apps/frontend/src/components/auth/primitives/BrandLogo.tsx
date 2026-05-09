'use client';

import React from 'react';

export interface BrandLogoProps {
  size?: number;
  className?: string;
}

export function BrandLogo({ size = 32, className = '' }: BrandLogoProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CV Lint logo"
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="20" r="2" fill="white" />
    </svg>
  );
}
