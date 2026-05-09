import { ATS_CONFIG } from '../core/constants'
import { ATSAnalysisResult } from '../core/types'

interface KeywordEngineResult {
  score: number
  matched: unknown[]
  partial: unknown[]
}

interface BasicEngineResult {
  score: number
}

export class ScoreCalculator {
  calculate(
    keywordResult: KeywordEngineResult,
    contextResult: BasicEngineResult,
    experienceResult: BasicEngineResult,
    educationResult: BasicEngineResult,
    formatResult: BasicEngineResult,
  ): ATSAnalysisResult['score'] {
    const breakdown = {
      keywordMatch: keywordResult.score,
      contextualRelevance: contextResult.score,
      experienceAlignment: experienceResult.score,
      educationMatch: educationResult.score,
      formatQuality: formatResult.score,
    }

    const overall = Math.round(
      breakdown.keywordMatch * ATS_CONFIG.WEIGHTS.KEYWORD_MATCH +
      breakdown.contextualRelevance * ATS_CONFIG.WEIGHTS.CONTEXTUAL_RELEVANCE +
      breakdown.experienceAlignment * ATS_CONFIG.WEIGHTS.EXPERIENCE_ALIGNMENT +
      breakdown.educationMatch * ATS_CONFIG.WEIGHTS.EDUCATION_MATCH +
      breakdown.formatQuality * ATS_CONFIG.WEIGHTS.FORMAT_QUALITY,
    )

    return {
      overall: Math.max(0, Math.min(100, overall)),
      breakdown,
    }
  }
}
