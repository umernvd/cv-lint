'use client';

import Link from 'next/link';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

export function EmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <MaterialIcon icon="history" className="text-5xl text-primary" />
      </div>
      <h3 className="mb-2 font-heading text-h2 text-foreground">No scans yet</h3>
      <p className="mb-8 max-w-md text-body text-muted-foreground">
        Start analyzing resumes against job descriptions to see your match history here.
      </p>
      <Link
        href="/analyze"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop transition-all duration-300 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0 active:translate-y-0 active:shadow-pop-active"
      >
        <MaterialIcon icon="add" className="text-lg" filled />
        Create First Analysis
      </Link>
    </div>
  );
}
