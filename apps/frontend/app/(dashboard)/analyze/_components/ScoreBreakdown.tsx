import type { ScoreBreakdown } from '@/types/analysis'

type ScoreBreakdownProps = {
  breakdown: ScoreBreakdown
  className?: string
}

const METRICS: { key: keyof ScoreBreakdown; label: string; icon: string }[] = [
  { key: 'keywordMatch', label: 'Keyword Match', icon: 'search' },
  { key: 'contextualRelevance', label: 'Contextual Relevance', icon: 'contextual_token' },
  { key: 'experienceAlignment', label: 'Experience Alignment', icon: 'work_history' },
  { key: 'educationMatch', label: 'Education Match', icon: 'school' },
  { key: 'formatQuality', label: 'Format Quality', icon: 'format_align_left' },
]

export function ScoreBreakdown({ breakdown, className }: ScoreBreakdownProps): React.JSX.Element {
  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      {METRICS.map(({ key, label, icon }) => {
        const score = breakdown[key]

        return (
          <div key={key}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-muted-foreground">{icon}</span>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {score}/100
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
