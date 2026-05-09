import { useEffect, useState } from 'react'

type AtsScoreCircleStaticProps = {
  atsScore: number
  className?: string
}

const SIZE = 160
const STROKE_WIDTH = 12
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function AtsScoreCircleStatic({
  atsScore,
  className,
}: AtsScoreCircleStaticProps): React.JSX.Element {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    requestAnimationFrame(() => {
      setAnimatedScore(atsScore)
    })
  }, [atsScore])

  const dashOffset = CIRCUMFERENCE - (animatedScore / 100) * CIRCUMFERENCE

  return (
    <div
      role="img"
      aria-label={`ATS match score: ${atsScore} out of 100`}
      className={`relative inline-flex items-center justify-center ${className ?? ''}`}
    >
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
      <div className="absolute flex flex-col items-center">
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
  )
}
