export interface ScanSummary {
  id: string
  jobTitle: string | null
  companyName: string | null
  atsScore: number
  createdAt: Date
}

export interface PaginatedScansResponse {
  data: ScanSummary[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ScanDetail {
  id: string
  jobTitle: string | null
  companyName: string | null
  atsScore: number
  createdAt: Date
  updatedAt: Date
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
    createdAt: Date
  }>
}
