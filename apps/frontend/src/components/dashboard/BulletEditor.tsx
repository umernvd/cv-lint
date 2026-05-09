import { useEffect, useRef, useState, startTransition } from 'react'
import { Wand2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, extractApiError, type ApiEnvelope, type ControllerEnvelope } from '@/lib/api-client'
import { useAnalysisStore } from '@/store/analysisStore'
import RewriteSuggestion from '@/components/dashboard/RewriteSuggestion'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { RewriteBulletResponse, RewriteSuggestion as RewriteSuggestionType, AnalysisResult } from '@/types/analysis'

type BulletEditorProps = {
  className?: string
}

export default function BulletEditor({
  className,
}: BulletEditorProps): React.JSX.Element {
  const bullets = useAnalysisStore((state) => state.bullets)
  const jdText = useAnalysisStore((state) => state.jdText)
  const isAnalyzing = useAnalysisStore((state) => state.isAnalyzing)
  const updateBullet = useAnalysisStore((state) => state.updateBullet)
  const setAnalysisResult = useAnalysisStore((state) => state.setAnalysisResult)

  const [selectedBulletId, setSelectedBulletId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [rewriteSuggestions, setRewriteSuggestions] = useState<RewriteSuggestionType[]>([])
  const [isRequestingRewrite, setIsRequestingRewrite] = useState(false)
  const [rewriteError, setRewriteError] = useState<string | null>(null)
  const [acceptedSuggestionId, setAcceptedSuggestionId] = useState<string | null>(null)

  const recalcTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (recalcTimer.current) {
        clearTimeout(recalcTimer.current)
      }
    }
  }, [])

  function handleSelectBullet(bulletId: string, text: string): void {
    setSelectedBulletId(bulletId)
    setEditingText(text)
  }

  async function requestBulletRewrite(bulletId: string, bulletText: string): Promise<void> {
    setIsRequestingRewrite(true)
    setRewriteError(null)
    setRewriteSuggestions([])
    setAcceptedSuggestionId(null)

    try {
      const response = await apiClient.post<ApiEnvelope<ControllerEnvelope<RewriteBulletResponse>>>(
        '/cv/rewrite-bullet',
        { bulletText, jdText },
      )
      startTransition(() => {
        setRewriteSuggestions(response.data.data.data.suggestions)
      })
    } catch (error: unknown) {
      const message = extractApiError(error)
      setRewriteError(message)
      toast.error(message)
    } finally {
      setIsRequestingRewrite(false)
    }
  }

  function handleAcceptSuggestion(bulletId: string, newText: string): void {
    updateBullet(bulletId, newText)
    setAcceptedSuggestionId(bulletId)
    setEditingText(newText)
    scheduleRecalculation(bulletId, newText)

    setTimeout(() => {
      setRewriteSuggestions([])
      setAcceptedSuggestionId(null)
    }, 1200)
  }

  function handleSkipSuggestion(suggestionId: string): void {
    setRewriteSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
  }

  function scheduleRecalculation(updatedBulletId: string, updatedText: string): void {
    if (recalcTimer.current) {
      clearTimeout(recalcTimer.current)
    }

    recalcTimer.current = setTimeout(() => {
      recalculateScore(updatedBulletId, updatedText)
    }, 800)
  }

  async function recalculateScore(editedBulletId: string, editedText: string): Promise<void> {
    const currentBullets = useAnalysisStore.getState().bullets
    const currentJdText = useAnalysisStore.getState().jdText

    const rebuiltCv = currentBullets
      .map((b) => {
        if (b.id === editedBulletId) return editedText
        return b.improved || b.original
      })
      .join('\n')

    const formData = new FormData()
    formData.append('cv', new Blob([rebuiltCv], { type: 'text/plain' }), 'cv.txt')
    formData.append('jdText', currentJdText)

    try {
      const response = await apiClient.post<ApiEnvelope<ControllerEnvelope<AnalysisResult>>>(
        '/cv/analyze',
        formData,
      )
      startTransition(() => {
        setAnalysisResult(response.data.data.data)
      })
    } catch {
      // Background recalculation — silently fail
    }
  }

  function handleTextareaChange(bulletId: string, value: string): void {
    setEditingText(value)
    scheduleRecalculation(bulletId, value)
  }

  const isLoading = isAnalyzing && bullets.length === 0
  const skeletonHeights = ['h-16', 'h-12', 'h-20', 'h-12']

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Bullet Points
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {skeletonHeights.map((h, i) => (
            <Skeleton key={i} className={`w-full rounded-lg ${h}`} />
          ))}
        </div>
      ) : bullets.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">
          No bullet points available for editing.
        </p>
      ) : (
        bullets.map((bullet, index) => {
          const isSelected = selectedBulletId === bullet.id
          const displayText = isSelected ? editingText : bullet.improved || bullet.original

          return (
            <div key={bullet.id}>
              <div
                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
                onClick={() => handleSelectBullet(bullet.id, bullet.improved || bullet.original)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectBullet(bullet.id, bullet.improved || bullet.original)
                  }
                }}
              >
                <textarea
                  aria-label={`Bullet point ${index + 1}`}
                  value={displayText}
                  onChange={(e) => handleTextareaChange(bullet.id, e.target.value)}
                  readOnly={!isSelected}
                  className={`min-h-[80px] w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? 'border-primary/50'
                      : 'border-0 focus-visible:outline-none'
                  }`}
                />
              </div>

              {isSelected && (
                <div className="mt-3 space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isRequestingRewrite}
                    aria-busy={isRequestingRewrite}
                    onClick={() => requestBulletRewrite(bullet.id, editingText)}
                  >
                    {isRequestingRewrite ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating suggestions…
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Suggest Rewrite
                      </>
                    )}
                  </Button>

                  {rewriteError && (
                    <p className="text-sm text-destructive">{rewriteError}</p>
                  )}

                  {rewriteSuggestions.length > 0 && (
                    <div className="space-y-3" aria-live="polite">
                      <Separator />
                      {rewriteSuggestions.map((suggestion) => (
                        <RewriteSuggestion
                          key={suggestion.id}
                          suggestion={suggestion}
                          isAccepted={acceptedSuggestionId === suggestion.id}
                          onAccept={() => handleAcceptSuggestion(bullet.id, suggestion.text)}
                          onSkip={() => handleSkipSuggestion(suggestion.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
