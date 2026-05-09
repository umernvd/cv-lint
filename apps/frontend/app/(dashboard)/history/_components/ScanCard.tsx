'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import type { ScanSummary } from '@/types/analysis';
import { resolveScoreColor, resolveScoreLabel } from '@/lib/score-utils';

type ScanCardProps = {
  scan: ScanSummary;
  onDelete: (id: string) => void;
  isDeletePending: boolean;
};

function formatScanDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return 'Unknown date'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch {
    return 'Unknown date'
  }
}

const companyIcons = [
  'badge',
  'business_center',
  'work',
  'groups',
  'apartment',
  'domain',
  'storefront',
  'engineering',
  'terminal',
  'code',
  'rocket_launch',
  'hub',
];

function getCompanyIcon(name: string | null): string {
  if (!name) return 'badge';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return companyIcons[Math.abs(hash) % companyIcons.length];
}

export function ScanCard({ scan, onDelete, isDeletePending }: ScanCardProps): React.JSX.Element {
  const scoreColor = resolveScoreColor(scan.atsScore);
  const scoreLabel = resolveScoreLabel(scan.atsScore);
  const formattedDate = formatScanDate(scan.createdAt);
  const icon = getCompanyIcon(scan.companyName);

  const labelMap = { good: 'Good', moderate: 'Fair', poor: 'Poor' };

  return (
    <article className="group relative overflow-hidden rounded-xl border-2 border-foreground/15 bg-white p-5 shadow-sticker transition-all duration-300 ease-bounce hover:-rotate-[0.5deg] hover:scale-[1.02] hover:shadow-md md:p-6">
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <Link
          href={`/history/${scan.id}`}
          className="flex flex-1 items-center gap-4"
          aria-label={`View scan for ${scan.jobTitle ?? 'Untitled'} at ${scan.companyName ?? 'Unknown company'}`}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <MaterialIcon icon={icon} filled />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-lg font-semibold text-foreground">
              {scan.jobTitle ?? 'Untitled Position'}
            </h3>
            <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="truncate font-medium text-foreground/70">
                {scan.companyName ?? 'No company'}
              </span>
              <span className="shrink-0">·</span>
              <span className="shrink-0">{formattedDate}</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4 border-t border-border/30 pt-4 md:border-t-0 md:pt-0">
          <div className="flex flex-col items-end">
            <span
              className="text-2xl font-bold leading-none font-heading"
              style={{ color: scoreColor }}
            >
              {scan.atsScore}%
            </span>
            <span className="mt-0.5 text-xs font-medium text-muted-foreground">
              {labelMap[scoreLabel]}
            </span>
          </div>

          <button
            type="button"
            aria-label="Delete scan"
            disabled={isDeletePending}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete(scan.id);
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
          >
            {isDeletePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MaterialIcon icon="delete" className="text-xl" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
