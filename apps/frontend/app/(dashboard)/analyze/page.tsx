'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useAnalysis } from '@/hooks/useAnalysis'
import { extractApiError } from '@/lib/api-client'
import { InputPanel } from './_components/InputPanel'
import { ResultsPanel } from './_components/ResultsPanel'

export default function AnalyzePage(): React.JSX.Element | null {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const { analyzeCV, uploadProgress } = useAnalysis()
  const [isPending, startTransition] = useTransition()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [jdText, setJdText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const isSubmitting = useRef(false)

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace('/sign-in')
    }
  }, [hasHydrated, isAuthenticated, router])

  if (!hasHydrated) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  async function handleAnalyze(): Promise<void> {
    if (!pdfFile || isSubmitting.current || isAnalyzing) return
    isSubmitting.current = true
    setIsAnalyzing(true)
    try {
      await analyzeCV(pdfFile, jdText)
      startTransition(() => {})
    } catch (error: unknown) {
      toast.error(extractApiError(error))
    } finally {
      setIsAnalyzing(false)
      isSubmitting.current = false
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] overflow-hidden bg-background bg-dot-grid">
      <div className="relative z-10 flex w-full flex-col md:flex-row">
        <section className="w-full border-r-2 border-foreground/10 bg-white/80 backdrop-blur-sm md:w-[38%]">
          <InputPanel
            pdfFile={pdfFile}
            jdText={jdText}
            onFileSelect={setPdfFile}
            onJdChange={setJdText}
            onAnalyze={handleAnalyze}
            isLoading={isAnalyzing}
            uploadProgress={uploadProgress}
          />
        </section>

        <section className="h-[calc(100vh-3.5rem)] w-full md:w-[62%]">
          <ResultsPanel isLoading={isAnalyzing} />
        </section>
      </div>
    </div>
  )
}
