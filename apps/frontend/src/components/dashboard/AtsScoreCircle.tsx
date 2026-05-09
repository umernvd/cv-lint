import { useEffect, useState } from 'react'
import { useAnalysisStore } from '@/store/analysisStore'
import { Skeleton } from '@/components/ui/skeleton'

type AtsScoreCircleProps = {
  className?: string
}

const SIZE = 160
const STROKE_WIDTH = 12
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function AtsScoreCircle({
  className,
}: AtsScoreCircleProps): React.JSX.Element {
  const atsScore = useAnalysisStore((state) => state.atsScore)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    if (atsScore === null) {
      setAnimatedScore(0)
      return
    }
    requestAnimationFrame(() => {
      setAnimatedScore(atsScore)
    })
  }, [atsScore])

  if (atsScore === null) {
    return <Skeleton className="h-40 w-40 rounded-full" />
  }

  const dashOffset = CIRCUMFERENCE - (animatedScore / 100) * CIRCUMFERENCE

  return (
    <div
      role="img"
      aria-label={`ATS match score: ${atsScore} out of 100`}
      className={`relative inline-flex items-center justify-center ${className ?? ''}`}
    >
      <div className="pointer-events-none absolute -right-3 -top-3 h-8 w-8 rounded-full bg-tertiary/20" />
      <div className="pointer-events-none absolute -left-2 -bottom-2 h-6 w-6 rotate-45 rounded bg-secondary/20" />
      <div className="relative rounded-2xl border-2 border-foreground/15 bg-white p-6 shadow-sticker transition-all duration-300 ease-bounce hover:-rotate-[0.5deg] hover:scale-[1.02]">
        <svg
          width={SIZE}
          height={SIZE}
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            className="text-muted"
            opacity={0.2}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 700ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold text-foreground"
          >
            {Math.round(animatedScore)}
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            ATS Match
          </span>
        </div>
      </div>
    </div>
  )
}
