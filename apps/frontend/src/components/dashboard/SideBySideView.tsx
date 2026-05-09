import { useMemo, useRef, useEffect, useCallback } from 'react'
import { useAnalysisStore } from '@/store/analysisStore'
import { Skeleton } from '@/components/ui/skeleton'
import type { DiffSegment } from '@/types/analysis'

type SideBySideViewProps = {
  className?: string
}

function computeDiff(original: string, edited: string): DiffSegment[] {
  const originalLines = original.split('\n')
  const editedLines = edited.split('\n')
  const segments: DiffSegment[] = []
  const maxLines = Math.max(originalLines.length, editedLines.length)

  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i]
    const editLine = editedLines[i]

    if (origLine === undefined) {
      segments.push({ value: editLine ?? '', added: true, removed: false })
    } else if (editLine === undefined) {
      segments.push({ value: origLine, added: false, removed: true })
    } else if (origLine === editLine) {
      segments.push({ value: origLine, added: false, removed: false })
    } else {
      segments.push({ value: origLine, added: false, removed: true })
      segments.push({ value: editLine, added: true, removed: false })
    }
  }

  return segments
}

export default function SideBySideView({
  className,
}: SideBySideViewProps): React.JSX.Element {
  const cvText = useAnalysisStore((state) => state.cvText)
  const bullets = useAnalysisStore((state) => state.bullets)
  const isAnalyzing = useAnalysisStore((state) => state.isAnalyzing)

  const editedCvText = useMemo(
    () => bullets.map((b) => b.improved || b.original).join('\n'),
    [bullets],
  )

  const diffSegments = useMemo(
    () => computeDiff(cvText, editedCvText),
    [cvText, editedCvText],
  )

  const originalRef = useRef<HTMLDivElement>(null)
  const editedRef = useRef<HTMLDivElement>(null)
  const isSyncing = useRef(false)

  const handleScroll = useCallback(
    (source: React.RefObject<HTMLDivElement | null>, target: React.RefObject<HTMLDivElement | null>) => {
      return () => {
        if (isSyncing.current) return
        isSyncing.current = true
        if (source.current && target.current) {
          target.current.scrollTop = source.current.scrollTop
        }
        requestAnimationFrame(() => {
          isSyncing.current = false
        })
      }
    },
    [],
  )

  const handleOriginalScroll = handleScroll(originalRef, editedRef)
  const handleEditedScroll = handleScroll(editedRef, originalRef)

  if (cvText === '' && isAnalyzing) {
    return (
      <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className ?? ''}`}>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${['w-full', 'w-5/6', 'w-4/6', 'w-full', 'w-3/4', 'w-5/6', 'w-full', 'w-2/3'][i]}`} />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${['w-full', 'w-4/6', 'w-5/6', 'w-3/4', 'w-full', 'w-2/3', 'w-5/6', 'w-full'][i]}`} />
          ))}
        </div>
      </div>
    )
  }

  if (cvText === '' && !isAnalyzing) {
    return (
      <div className={`flex items-center justify-center py-16 ${className ?? ''}`}>
        <p className="text-sm text-muted-foreground">
          Run an analysis to see your CV here.
        </p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className ?? ''}`}>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Original
        </h3>
        <div
          ref={originalRef}
          role="region"
          aria-label="Original CV text"
          className="overflow-y-auto max-h-[600px] rounded-xl border-2 border-foreground/15 bg-white p-4 shadow-sticker transition-all duration-200"
          onScroll={handleOriginalScroll}
        >
          <pre className="whitespace-pre-wrap font-mono text-sm">{cvText}</pre>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Edited
        </h3>
        <div
          ref={editedRef}
          role="region"
          aria-label="Edited CV text with highlighted changes"
          aria-live="polite"
          className="overflow-y-auto max-h-[600px] rounded-xl border-2 border-foreground/15 bg-white p-4 shadow-sticker transition-all duration-200"
          onScroll={handleEditedScroll}
        >
          {diffSegments.map((segment, index) => {
            const baseClasses = 'block font-mono text-sm'
            const colorClasses = segment.added
              ? 'bg-success/10 text-success font-medium rounded px-1'
              : segment.removed
                ? 'bg-destructive/10 text-destructive line-through rounded px-1'
                : ''

            return (
              <span
                key={index}
                className={`${baseClasses} ${colorClasses}`}
              >
                {segment.value}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
