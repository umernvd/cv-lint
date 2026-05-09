import { CVData, ATSEngineResult } from '../core/types'
import {
  hasEmail,
  hasPhone,
  hasDates,
  hasQuantifiableAchievements,
  hasActionVerbs,
  countWords,
} from '../core/utils'

const REQUIRED_SECTIONS: (keyof CVData['sections'])[] = [
  'experience',
  'education',
  'skills',
]

export class FormatQualityEngine {
  private readonly cvData: CVData

  constructor(cvData: CVData) {
    this.cvData = cvData
  }

  analyze(): ATSEngineResult {
    const insights: string[] = []
    let score = 100

    const missingSections = REQUIRED_SECTIONS.filter(
      (section) => !this.cvData.sections[section],
    )

    if (missingSections.length > 0) {
      score -= missingSections.length * 15
      insights.push(`Add missing sections: ${missingSections.join(', ')}`)
    }

    const wordCount = this.cvData.metadata.wordCount || countWords(this.cvData.rawText)
    if (wordCount < 300) {
      score -= 20
      insights.push('CV is too brief - expand with more details about your experience')
    } else if (wordCount > 1500) {
      score -= 10
      insights.push('CV is lengthy - focus on most relevant experiences')
    }

    if (!hasEmail(this.cvData.rawText)) {
      score -= 15
      insights.push('Ensure contact information (email) is clearly visible')
    }

    if (!hasDates(this.cvData.rawText)) {
      score -= 10
      insights.push('Include dates for all experiences and education')
    }

    if (!hasQuantifiableAchievements(this.cvData.rawText)) {
      score -= 10
      insights.push(
        'Add numbers and metrics to demonstrate impact (e.g., "increased sales by 25%")',
      )
    }

    if (!hasActionVerbs(this.cvData.rawText)) {
      score -= 5
      insights.push('Start bullet points with strong action verbs')
    }

    if (!this.cvData.metadata.hasFormatting && this.cvData.metadata.fileSize > 0) {
      score -= 5
      insights.push('Consider adding formatting (bold, headers) to improve readability')
    }

    const pageCount = this.cvData.metadata.pageCount
    if (pageCount > 3) {
      score -= 5
      insights.push('Consider condensing to 1-2 pages for most ATS systems')
    } else if (pageCount === 0) {
      score -= 3
      insights.push('CV could not determine page count - ensure proper PDF structure')
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      insights,
    }
  }
}
