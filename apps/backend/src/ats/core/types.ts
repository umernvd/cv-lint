export type KeywordImportance = 'critical' | 'high' | 'medium' | 'low'

export type RecommendationType = 'critical' | 'important' | 'suggested'

export type RecommendationCategory = 'keyword' | 'experience' | 'education' | 'format' | 'content'

export interface CVData {
  rawText: string
  sections: {
    personal?: string
    summary?: string
    experience?: string
    education?: string
    skills?: string
    certifications?: string
  }
  metadata: {
    pageCount: number
    wordCount: number
    hasFormatting: boolean
    fileSize: number
  }
}

export interface JobDescription {
  rawText: string
  parsed: {
    title?: string
    requirements: {
      required: string[]
      preferred: string[]
    }
    skills: {
      technical: string[]
      soft: string[]
    }
    experience: {
      years?: number
      level?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
    }
    education: {
      degree?: string
      field?: string
      required: boolean
    }
  }
}

export interface KeywordMatch {
  keyword: string
  found: boolean
  frequency: number
  context: string[]
  importance: KeywordImportance
  similarity: number
}

export interface ATSEngineResult {
  score: number
  insights: string[]
}

export interface ATSAnalysisResult {
  score: {
    overall: number
    breakdown: {
      keywordMatch: number
      contextualRelevance: number
      experienceAlignment: number
      educationMatch: number
      formatQuality: number
    }
  }
  keywords: {
    matched: KeywordMatch[]
    missing: KeywordMatch[]
    partial: KeywordMatch[]
  }
  recommendations: Recommendation[]
  metadata: {
    analyzedAt: Date
    processingTime: number
    confidence: number
    source: 'ai' | 'local' | 'hybrid'
  }
}

export interface Recommendation {
  type: RecommendationType
  category: RecommendationCategory
  title: string
  description: string
  impact: number
  actionable: boolean
  suggestion?: string
}

export type ScoreBreakdownLocal = {
  keywordMatch: number
  contextualRelevance: number
  experienceAlignment: number
  educationMatch: number
  formatQuality: number
}
