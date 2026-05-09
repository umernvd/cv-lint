type MockupScoreCircleProps = {
  score: number
  label: string
}

export default function MockupScoreCircle({
  score,
  label,
}: MockupScoreCircleProps): React.JSX.Element {
  const circumference = 2 * Math.PI * 40
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex flex-col items-center gap-sm">
      <svg
        viewBox="0 0 100 100"
        className="-rotate-90 h-28 w-28"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-border/30"
          strokeDasharray={circumference.toFixed(1)}
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference.toFixed(1)}
          strokeDashoffset={dashOffset.toFixed(1)}
          className="text-tertiary"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-h1 text-foreground">{score}</span>
      </div>
      <span className="text-caption text-tertiary font-medium tracking-wide">
        {label}
      </span>
    </div>
  )
}
