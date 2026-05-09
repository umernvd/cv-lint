export function resolveScoreColor(score: number): string {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

export function resolveScoreLabel(score: number): 'good' | 'moderate' | 'poor' {
  if (score >= 70) return 'good'
  if (score >= 40) return 'moderate'
  return 'poor'
}
