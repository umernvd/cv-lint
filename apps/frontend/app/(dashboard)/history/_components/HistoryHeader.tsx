'use client';

import Link from 'next/link';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

export function HistoryHeader(): React.JSX.Element {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-h1 font-heading text-foreground">Scan History</h1>
        <p className="mt-1 max-w-xl text-body text-muted-foreground">
          Review and manage your past AI-driven resume analyses and job match scores.
        </p>
      </div>
      <Link
        href="/analyze"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop transition-all duration-300 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0 active:translate-y-0 active:shadow-pop-active"
      >
        <MaterialIcon icon="add" className="text-lg" filled />
        New Analysis
      </Link>
    </div>
  );
}
