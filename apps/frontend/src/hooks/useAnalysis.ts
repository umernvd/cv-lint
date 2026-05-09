import { startTransition, useState, useCallback } from 'react'
import { apiClient, extractApiError, type ApiEnvelope, type ControllerEnvelope } from '@/lib/api-client'
import { useAnalysisStore } from '@/store/analysisStore'
import type { AnalysisResult } from '@/types/analysis'
import axios from 'axios'

export function useAnalysis(): {
  analyzeCV: (file: File, jdText: string) => Promise<void>
  isLoading: boolean
  error: string | null
  uploadProgress: number
} {
  const { isAnalyzing, error, setAnalysisResult, setIsAnalyzing, setError, startNewRequest, discardStaleResult } = useAnalysisStore()
  const [uploadProgress, setUploadProgress] = useState(0)

  const analyzeCV = useCallback(async (file: File, jdText: string): Promise<void> => {
    const requestId = startNewRequest()
    setIsAnalyzing(true)
    setError(null)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('cv', file)
    formData.append('jdText', jdText)

    const startTime = Date.now()
    const minLoadingMs = 800

    try {
      const response = await apiClient.post<ApiEnvelope<ControllerEnvelope<AnalysisResult>>>(
        '/cv/analyze',
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setUploadProgress(percent)
            }
          },
        },
      )
      if (discardStaleResult(requestId)) return
      const elapsed = Date.now() - startTime
      if (elapsed < minLoadingMs) {
        await new Promise((resolve) => setTimeout(resolve, minLoadingMs - elapsed))
      }
      startTransition(() => {
        setAnalysisResult(response.data.data.data, requestId)
        setUploadProgress(0)
      })
    } catch (err: unknown) {
      if (discardStaleResult(requestId)) return
      setUploadProgress(0)
      setError(extractApiError(err))
      throw err
    }
  }, [setIsAnalyzing, setError, startNewRequest, discardStaleResult, setAnalysisResult])

  return { analyzeCV, isLoading: isAnalyzing, error, uploadProgress }
}
