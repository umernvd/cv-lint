import MockupScoreCircle from './primitives/MockupScoreCircle'
import KeywordGapRow from './primitives/KeywordGapRow'
import { MOCKUP_SCORE, MOCKUP_SCORE_LABEL, MOCKUP_KEYWORDS } from './landing-content'

export default function HeroDashboardMockup(): React.JSX.Element {
  return (
    <div className="w-full max-w-5xl px-margin mb-3xl">
      <div className="rounded-xl border-2 border-foreground/15 bg-white shadow-sticker overflow-hidden">
        <div className="h-12 border-b-2 border-border/20 flex items-center px-4 gap-2 bg-muted/30">
          <div className="w-3 h-3 rounded-full bg-border/50" />
          <div className="w-3 h-3 rounded-full bg-border/50" />
          <div className="w-3 h-3 rounded-full bg-border/50" />
        </div>
        <div className="p-xl grid grid-cols-1 md:grid-cols-3 gap-xl">
          <div className="col-span-1 rounded-lg border-2 border-border/20 bg-white p-lg flex flex-col items-center justify-center gap-md">
            <MockupScoreCircle score={MOCKUP_SCORE} label={MOCKUP_SCORE_LABEL} />
          </div>
          <div className="col-span-1 md:col-span-2 rounded-lg border-2 border-border/20 bg-white p-lg flex flex-col gap-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-muted-foreground text-xl">radar</span>
              <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Keyword Gap Analysis
              </span>
            </div>
            {MOCKUP_KEYWORDS.map((kw) => (
              <KeywordGapRow
                key={kw.keyword}
                keyword={kw.keyword}
                status={kw.status}
                label={kw.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
