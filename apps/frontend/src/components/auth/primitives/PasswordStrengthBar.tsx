'use client';

import React from 'react';
import { passwordStrengthLabels } from '../auth-content';

export interface PasswordStrengthBarProps {
  score: number;
  label?: string;
}

export function PasswordStrengthBar({ score, label = 'Password strength' }: PasswordStrengthBarProps): React.JSX.Element {
  const widthPercent = Math.min((score / 4) * 100, 100);
  const strengthText = passwordStrengthLabels[score as keyof typeof passwordStrengthLabels] ?? '';

  const barColorClass =
    score <= 1
      ? 'bg-destructive'
      : score === 2
        ? 'bg-tertiary'
        : 'bg-success';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-xs font-medium ${score <= 1 ? 'text-destructive' : score === 2 ? 'text-tertiary' : 'text-success'}`} aria-hidden="true">
          {strengthText}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={4} aria-label={label}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}
