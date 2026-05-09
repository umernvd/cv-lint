import type { ScoreBreakdown } from '../ai/interfaces/ai-provider.interface'

export interface AnalysisResponse {
  scanId: string
  atsScore: number
  scoreBreakdown: ScoreBreakdown
  matchedKeywords: string[]
  missingKeywords: string[]
  topRecommendations: string[]
  jobTitle: string | null
  companyName: string | null
  cvText: string
  jdText: string
  bullets: Array<{
    id: string
    original: string
    improved: string
    isEditing: boolean
  }>
}

export interface RewriteResponse {
  bulletEditId: string
  suggestions: Array<{ text: string; explanation: string }>
}
