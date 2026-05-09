'use client';

import { MaterialIcon } from '@/components/shared/MaterialIcon';

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  totalResults?: number;
  pageSize: number;
};

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
  totalResults,
  pageSize,
}: PaginationControlsProps): React.JSX.Element | null {
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push(i < currentPage ? 'ellipsis-start' : 'ellipsis-end');
    }
  }

  const uniquePages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
  const seen = new Set<string>();
  for (const p of pages) {
    const key = typeof p === 'number' ? String(p) : p;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePages.push(p);
    }
  }

  const startResult = totalResults && totalResults > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endResult = totalResults ? Math.min(currentPage * pageSize, totalResults) : currentPage * pageSize;

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t-2 border-border/20 pt-6 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing {startResult}–{endResult} of {totalResults ?? '?'} results
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Previous page"
        >
          <MaterialIcon icon="chevron_left" />
        </button>

        <div className="flex items-center gap-0.5">
          {uniquePages.map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={page}
                type="button"
                disabled={isLoading}
                onClick={() => onPageChange(page)}
                className={`flex h-9 min-w-[36px] items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-30 ${
                  page === currentPage
                    ? 'bg-primary/10 text-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ) : (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 w-9 items-center justify-center text-muted-foreground/40"
              >
                …
              </span>
            ),
          )}
        </div>

        <button
          type="button"
          disabled={currentPage === totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Next page"
        >
          <MaterialIcon icon="chevron_right" />
        </button>
      </div>
    </div>
  );
}
