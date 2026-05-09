import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryPageSkeleton(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border-2 border-border/20 bg-white p-5 md:p-6"
        >
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-48 bg-muted" />
            <Skeleton className="h-4 w-32 bg-muted" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-16 rounded-full bg-muted" />
            <Skeleton className="h-9 w-9 rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
