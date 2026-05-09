import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function AnalysisPageSkeleton(): React.JSX.Element {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[2fr_3fr] gap-6">
      <div className="space-y-6 p-6 md:border-r md:p-8">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-40 rounded-xl" />
        <Separator />
        <Skeleton className="h-48 rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      <div className="space-y-6 p-6 md:p-8">
        <Skeleton className="h-8 w-32" />
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      </div>
    </div>
  )
}
