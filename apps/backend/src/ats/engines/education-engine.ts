import { JobDescription, ATSEngineResult } from '../core/types'
import { hasCertifications, hasDegree } from '../core/utils'

export class EducationMatchEngine {
  private readonly cvEducation: string
  private readonly jdEducation: JobDescription['parsed']['education']
  private readonly fullCVText: string

  constructor(
    cvEducation: string,
    jdEducation: JobDescription['parsed']['education'],
    fullCVText: string,
  ) {
    this.cvEducation = cvEducation.toLowerCase()
    this.jdEducation = jdEducation
    this.fullCVText = fullCVText
  }

  analyze(): ATSEngineResult {
    const insights: string[] = []
    let score = 100

    if (this.jdEducation.required) {
      const eduText = this.cvEducation || this.fullCVText.toLowerCase()
      const hasDegreeMatch = this.hasDegree(eduText)

      if (!hasDegreeMatch) {
        score = 30
        insights.push(
          'Job requires a degree - highlight any degrees or equivalent experience',
        )
      } else {
        if (this.jdEducation.degree) {
          const degreeMatch = this.matchesDegree(eduText, this.jdEducation.degree)
          if (!degreeMatch) {
            score -= 20
            insights.push(
              `Consider pursuing ${this.jdEducation.degree} or highlighting equivalent qualifications`,
            )
          }
        }

        if (this.jdEducation.field) {
          const fieldMatch = this.matchesField(eduText, this.jdEducation.field)
          if (!fieldMatch) {
            score -= 15
            insights.push(
              `Highlight coursework or projects in ${this.jdEducation.field}`,
            )
          }
        }
      }
    } else {
      const eduText = this.cvEducation || this.fullCVText.toLowerCase()

      if (!this.hasDegree(eduText)) {
        score -= 10
        insights.push(
          'Consider adding relevant certifications to strengthen your profile',
        )
      }
    }

    const certText = this.cvEducation || this.fullCVText
    if (!hasCertifications(certText)) {
      score -= 5
      insights.push(
        'Industry certifications can boost your ATS score significantly',
      )
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      insights,
    }
  }

  private hasDegree(text: string): boolean {
    return hasDegree(text)
  }

  private matchesDegree(text: string, requiredDegree: string): boolean {
    const lower = text.toLowerCase()
    const required = requiredDegree.toLowerCase()

    const degreeMap: Record<string, string[]> = {
      bachelor: ['bachelor', 'bs', 'ba', 'b.eng', 'bsc'],
      master: ['master', 'ms', 'ma', 'm.eng', 'msc', 'mba'],
      phd: ['phd', 'doctorate', 'ph.d'],
    }

    if (degreeMap[required]) {
      return degreeMap[required].some((variant) => lower.includes(variant))
    }

    return lower.includes(required)
  }

  private matchesField(text: string, requiredField: string): boolean {
    const lower = text.toLowerCase()
    const required = requiredField.toLowerCase()

    const fieldAliases: Record<string, string[]> = {
      'computer science': ['computer science', 'cs', 'computing', 'software engineering'],
      engineering: ['engineering', 'computer engineering', 'software engineering'],
      mathematics: ['mathematics', 'math', 'statistics', 'applied mathematics'],
      'information technology': ['information technology', 'it', 'information systems', 'mis'],
    }

    if (fieldAliases[required]) {
      return fieldAliases[required].some((alias) => lower.includes(alias))
    }

    return lower.includes(required)
  }
}
