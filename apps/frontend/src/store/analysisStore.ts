import { create } from 'zustand'
import type { AnalysisResult, BulletItem, ScoreBreakdown } from '@/types/analysis'

type AnalysisState = {
  atsScore: number | null
  scoreBreakdown: ScoreBreakdown | null
  matchedKeywords: string[]
  missingKeywords: string[]
  topRecommendations: string[]
  cvText: string
  jdText: string
  scanId: string | null
  bullets: BulletItem[]
  isAnalyzing: boolean
  error: string | null
  currentRequestId: string | null
  setAnalysisResult: (result: AnalysisResult, requestId?: string) => void
  setIsAnalyzing: (value: boolean) => void
  setError: (message: string | null) => void
  updateBullet: (id: string, improved: string) => void
  clearAnalysis: () => void
  startNewRequest: () => string
  discardStaleResult: (requestId: string) => boolean
}

let requestCounter = 0

const initialState = {
  atsScore: null,
  scoreBreakdown: null,
  matchedKeywords: [],
  missingKeywords: [],
  topRecommendations: [],
  cvText: '',
  jdText: '',
  scanId: null,
  bullets: [],
  isAnalyzing: false,
  error: null,
  currentRequestId: null,
}

export const useAnalysisStore = create<AnalysisState>()((set, get) => ({
  ...initialState,
  startNewRequest: () => {
    const requestId = `req-${++requestCounter}-${Date.now()}`
    set({ currentRequestId: requestId })
    return requestId
  },
  discardStaleResult: (requestId: string) => {
    const currentId = get().currentRequestId
    if (currentId !== requestId) return true
    return false
  },
  setAnalysisResult: (result, requestId) => {
    if (requestId && get().currentRequestId !== requestId) return
    set({
      atsScore: result.atsScore,
      scoreBreakdown: result.scoreBreakdown,
      matchedKeywords: result.matchedKeywords,
      missingKeywords: result.missingKeywords,
      topRecommendations: result.topRecommendations,
      cvText: result.cvText,
      jdText: result.jdText,
      scanId: result.scanId,
      bullets: result.bullets,
      isAnalyzing: false,
      error: null,
      currentRequestId: null,
    })
  },
  setIsAnalyzing: (value) => set({ isAnalyzing: value }),
  setError: (message) => set({ error: message, isAnalyzing: false }),
  updateBullet: (id, improved) =>
    set((state) => {
      const exists = state.bullets.some((bullet) => bullet.id === id)
      if (!exists) return state
      return {
        bullets: state.bullets.map((bullet) =>
          bullet.id === id ? { ...bullet, improved } : bullet,
        ),
      }
    }),
  clearAnalysis: () => set(initialState),
}))
