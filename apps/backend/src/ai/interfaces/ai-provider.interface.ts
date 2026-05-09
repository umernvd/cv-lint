export interface IAiProvider {
  readonly name: string
  generateText(prompt: string): Promise<string>
}

export interface ScoreBreakdown {
  keywordMatch: number
  contextualRelevance: number
  experienceAlignment: number
  educationMatch: number
  formatQuality: number
}

export interface AtsAnalysisResult {
  atsScore: number
  scoreBreakdown: ScoreBreakdown
  matchedKeywords: string[]
  missingKeywords: string[]
  topRecommendations: string[]
  jobTitle: string | null
}

export interface RewriteSuggestion {
  text: string
  explanation: string
}

export interface RewriteResult {
  suggestions: RewriteSuggestion[]
}
