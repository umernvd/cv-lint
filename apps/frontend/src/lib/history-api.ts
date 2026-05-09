import { apiClient, type ApiEnvelope, type ControllerEnvelope } from '@/lib/api-client'
import type {
  PaginatedScansResponse,
  ScanDetailForDisplay,
  DeleteScanResponse,
  AnalysisResult,
  ScoreBreakdown,
} from '@/types/analysis'

const defaultBreakdown: ScoreBreakdown = {
  keywordMatch: 0,
  contextualRelevance: 0,
  experienceAlignment: 0,
  educationMatch: 0,
  formatQuality: 0,
}

export async function fetchScanHistory(
  page: number,
  limit: number,
): Promise<PaginatedScansResponse> {
  const response = await apiClient.get<ApiEnvelope<ControllerEnvelope<PaginatedScansResponse>>>('/history', {
    params: { page, limit },
  })
  return response.data.data.data
}

export async function fetchScanDetail(id: string): Promise<ScanDetailForDisplay> {
  const response = await apiClient.get<ApiEnvelope<ControllerEnvelope<ScanDetailRaw>>>(`/history/${id}`)
  const raw = response.data.data.data

  const matchedKeywords = raw.keywordResults
    .filter((kw) => kw.status === 'MATCHED')
    .map((kw) => kw.keyword)

  const missingKeywords = raw.keywordResults
    .filter((kw) => kw.status === 'MISSING')
    .map((kw) => kw.keyword)

  const bullets = raw.bulletEdits.map((edit) => ({
    id: edit.id,
    original: edit.originalText,
    improved: edit.suggestedText ?? '',
    isEditing: false,
  }))

  const result: AnalysisResult = {
    scanId: raw.id,
    atsScore: raw.atsScore,
    scoreBreakdown: defaultBreakdown,
    matchedKeywords,
    missingKeywords,
    topRecommendations: raw.topRecommendations ?? [],
    cvText: '',
    jdText: '',
    bullets,
  }

  return {
    id: raw.id,
    jobTitle: raw.jobTitle,
    companyName: raw.companyName,
    createdAt: raw.createdAt,
    result,
  }
}

type ScanDetailRaw = {
  id: string
  jobTitle: string | null
  companyName: string | null
  atsScore: number
  topRecommendations: string[]
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

export async function deleteScan(id: string): Promise<DeleteScanResponse> {
  const response = await apiClient.delete<ApiEnvelope<ControllerEnvelope<DeleteScanResponse>>>(`/history/${id}`)
  return response.data.data.data
}
