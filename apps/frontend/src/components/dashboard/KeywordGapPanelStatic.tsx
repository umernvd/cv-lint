import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type KeywordGapPanelStaticProps = {
  matchedKeywords: string[]
  missingKeywords: string[]
  className?: string
}

export default function KeywordGapPanelStatic({
  matchedKeywords,
  missingKeywords,
  className,
}: KeywordGapPanelStaticProps): React.JSX.Element {
  return (
    <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${className ?? ''}`}>
      <section aria-label="Matched Keywords">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Matched Keywords
          </h3>
        </div>
        {matchedKeywords.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            No matched keywords found.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2" role="list">
            {matchedKeywords.map((keyword) => (
              <span key={keyword} role="listitem">
                <Badge
                  variant="default"
                  className="rounded-none border-2 border-primary bg-white text-foreground font-mono font-medium"
                >
                  {keyword}
                </Badge>
              </span>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Missing Keywords">
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-[#b91c1c]" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Missing Keywords
          </h3>
        </div>
        {missingKeywords.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            No missing keywords — great job!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2" role="list">
            {missingKeywords.map((keyword) => (
              <span key={keyword} role="listitem">
                <Badge
                  variant="default"
                  className="rounded-none border-2 border-[#b91c1c] bg-white text-foreground font-mono font-medium"
                >
                  {keyword}
                </Badge>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
