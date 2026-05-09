import { useEffect, useRef, memo } from 'react';

type ScoreCircleProps = {
  score: number;
  size?: number;
  strokeWidth?: number;
};

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Poor';
  return 'Very Poor';
}

export const ScoreCircle = memo(function ScoreCircle({
  score,
  size = 160,
  strokeWidth = 10,
}: ScoreCircleProps): React.JSX.Element {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDasharray = circumference.toString();
      circleRef.current.style.strokeDashoffset = circumference.toString();
      requestAnimationFrame(() => {
        if (circleRef.current) {
          circleRef.current.style.strokeDashoffset = offset.toString();
        }
      });
    }
  }, [score, circumference, offset]);

  return (
    <div className="flex flex-col items-center gap-2" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`ATS match score: ${score} out of 100`}>
      <svg width={size} height={size} className="drop-shadow-lg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="score-ring"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2}
          y={size / 2 - 8}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground"
          style={{ fontSize: '40px', fontWeight: 700, fontFamily: 'inherit' }}
        >
          {score}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 20}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-muted-foreground"
          style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'inherit' }}
        >
          /100
        </text>
      </svg>
      <span className="text-sm font-medium" style={{ color: 'hsl(var(--primary))' }}>{getScoreLabel(score)}</span>
    </div>
  );
});
