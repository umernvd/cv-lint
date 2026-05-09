'use client'

import { useEffect, useState, startTransition } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, Trash2, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAnalysisStore } from '@/store/analysisStore'
import { useScanDetail } from '@/hooks/useScanDetail'
import { useDeleteScan } from '@/hooks/useDeleteScan'
import AtsScoreCircleStatic from '@/components/dashboard/AtsScoreCircleStatic'
import KeywordGapPanelStatic from '@/components/dashboard/KeywordGapPanelStatic'
import DeleteScanDialog from '@/components/dashboard/DeleteScanDialog'
import { Button } from '@/components/ui/button'
import ScanDetailSkeleton from '@/components/shared/skeletons/ScanDetailSkeleton'
import { extractApiError } from '@/lib/api-client'
import axios from 'axios'

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

export default function ScanDetailPage(): React.JSX.Element | null {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const { data: scanDetail, isLoading, isError, error } = useScanDetail(params?.id ?? '')
  const { mutate: deleteScan, isPending: isDeletePending } = useDeleteScan()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace('/sign-in')
    }
  }, [hasHydrated, isAuthenticated, router])

  function handleDeleteRequest(): void {
    setIsDialogOpen(true)
  }

  function handleDeleteConfirm(): void {
    deleteScan(params.id ?? '', {
      onSuccess: () => {
        router.replace('/history')
      },
    })
    setIsDialogOpen(false)
  }

  if (!hasHydrated) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  useEffect(() => {
    if (scanDetail) {
      startTransition(() => {
        useAnalysisStore.getState().setAnalysisResult(scanDetail.result)
      })
    }
  }, [scanDetail])

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <ScanDetailSkeleton />
      </main>
    )
  }

  if (isError) {
    const isNotFound = axios.isAxiosError(error) && error.response?.status === 404

    if (isNotFound) {
      return (
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="mb-2 font-heading text-2xl font-bold text-foreground">Scan not found.</h1>
          <p className="mb-6 text-muted-foreground">
            This scan may have been deleted or never existed.
          </p>
          <Button asChild variant="candy">
            <Link href="/history">Back to History</Link>
          </Button>
        </main>
      )
    }

    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <RefreshCw className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h1 className="mb-2 font-heading text-2xl font-bold text-foreground">Failed to load scan details.</h1>
        <p className="mb-2 text-sm text-muted-foreground">{extractApiError(error)}</p>
        <Button asChild variant="candy">
          <Link href="/history">Back to History</Link>
        </Button>
      </main>
    )
  }

  if (!scanDetail) {
    return null
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/history"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </Link>

      <header className="relative mb-8 overflow-hidden rounded-2xl border-2 border-foreground/15 bg-white p-6 shadow-sticker">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="font-heading text-3xl font-bold text-foreground">{scanDetail.jobTitle}</h1>
            <p className="mt-1 text-muted-foreground">
              {scanDetail.companyName ?? 'No company'} &middot; {formatScanDate(scanDetail.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeleteRequest}
            disabled={isDeletePending}
            className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
            aria-label="Delete this scan"
          >
            {isDeletePending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr] items-start">
        <AtsScoreCircleStatic atsScore={scanDetail.result.atsScore} className="w-fit" />
        <div className="rounded-2xl border-2 border-foreground/15 bg-white p-6 shadow-sticker transition-all duration-300 ease-bounce hover:-rotate-[0.3deg] hover:scale-[1.01]">
          <KeywordGapPanelStatic
            matchedKeywords={scanDetail.result.matchedKeywords}
            missingKeywords={scanDetail.result.missingKeywords}
          />
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">Top Recommendations</h2>
        </div>
        <ol className="space-y-3">
          {scanDetail.result.topRecommendations.map((rec, index) => (
            <li key={index} className="flex gap-3 rounded-xl border-2 border-foreground/10 bg-white p-4 shadow-sticker transition-all duration-200 hover:-translate-y-0.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-foreground">{rec}</p>
            </li>
          ))}
        </ol>
      </section>

      <DeleteScanDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleDeleteConfirm}
        isPending={isDeletePending}
        scanTitle={scanDetail.jobTitle ?? 'this scan'}
      />
    </main>
  )
}
