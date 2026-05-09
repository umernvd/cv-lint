export type ScoreBreakdown = {
  keywordMatch: number
  contextualRelevance: number
  experienceAlignment: number
  educationMatch: number
  formatQuality: number
}

export type BulletItem = {
  id: string
  original: string
  improved: string
  isEditing: boolean
}

export type AnalysisResult = {
  scanId: string
  atsScore: number
  scoreBreakdown: ScoreBreakdown
  matchedKeywords: string[]
  missingKeywords: string[]
  topRecommendations: string[]
  cvText: string
  jdText: string
  bullets: BulletItem[]
}

export type AnalysisApiResponse = {
  data: AnalysisResult
  message: string
}

export type RewriteSuggestion = {
  id: string
  text: string
  explanation: string
}

export type RewriteBulletResponse = {
  suggestions: RewriteSuggestion[]
}

export type DiffSegment = {
  value: string
  added: boolean
  removed: boolean
}

export type ScanSummary = {
  id: string
  jobTitle: string | null
  companyName: string | null
  atsScore: number
  createdAt: string
}

export type PaginatedScansResponse = {
  data: ScanSummary[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ScanDetail = {
  id: string
  jobTitle: string | null
  companyName: string | null
  atsScore: number
  createdAt: string
  updatedAt: string
  keywordResults: Array<{
    id: string
    keyword: string
    status: string
    category: string | null
  }>
  bulletEdits: Array<{
    id: string
    originalText: string
    suggestedText: string | null
    acceptedText: string | null
    wasAccepted: boolean
    createdAt: string
  }>
}

export type ScanDetailForDisplay = {
  id: string
  jobTitle: string | null
  companyName: string | null
  createdAt: string
  result: AnalysisResult
}

export type DeleteScanResponse = {
  success: boolean
}
