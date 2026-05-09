import { Skeleton } from '@/components/ui/skeleton'

export default function ScanDetailSkeleton(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-9 w-28 rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr]">
        <Skeleton className="h-40 w-40 rounded-full" />
        <div className="flex flex-col gap-4">
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-6 rounded-full"
                  style={{ width: `${60 + Math.floor(Math.random() * 60)}px` }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-6 rounded-full"
                  style={{ width: `${60 + Math.floor(Math.random() * 50)}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
