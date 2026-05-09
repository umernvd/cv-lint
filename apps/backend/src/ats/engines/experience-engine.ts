import { JobDescription, ATSEngineResult } from '../core/types'
import { extractYearRange, detectSeniorityLevel, hasCareerProgression } from '../core/utils'

export class ExperienceAlignmentEngine {
  private readonly cvText: string
  private readonly jdExperience: JobDescription['parsed']['experience']

  constructor(
    cvText: string,
    jdExperience: JobDescription['parsed']['experience'],
  ) {
    this.cvText = cvText
    this.jdExperience = jdExperience
  }

  analyze(): ATSEngineResult {
    const insights: string[] = []

    const cvYears = this.extractYearsOfExperience()
    const requiredYears = this.jdExperience.years || 0

    let score = 100

    if (requiredYears > 0) {
      if (cvYears < requiredYears) {
        const deficit = requiredYears - cvYears
        score -= deficit * 8
        insights.push(
          `Consider highlighting ${deficit} more year(s) of relevant experience`,
        )
      } else if (cvYears >= requiredYears * 1.5) {
        insights.push('Extensive experience may make this role a lateral move')
      }
    }

    const cvLevel = detectSeniorityLevel(this.cvText)
    const jdLevel = this.jdExperience.level

    if (jdLevel && cvLevel !== jdLevel) {
      const levelGap = this.calculateLevelGap(cvLevel, jdLevel)
      if (levelGap > 1) {
        score -= 20
        insights.push(
          `Emphasize ${jdLevel}-level responsibilities to align with this role`,
        )
      } else if (levelGap === 1) {
        score -= 10
        insights.push(`Highlight experience relevant to a ${jdLevel} position`)
      }
    }

    if (!hasCareerProgression(this.cvText)) {
      score -= 8
      insights.push('Show career growth with progressive responsibilities')
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      insights,
    }
  }

  private extractYearsOfExperience(): number {
    const { years } = extractYearRange(this.cvText)
    return years
  }

  private calculateLevelGap(
    cvLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive',
    jdLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive',
  ): number {
    const hierarchy = {
      entry: 0,
      mid: 1,
      senior: 2,
      lead: 3,
      executive: 4,
    }

    return Math.abs(hierarchy[cvLevel] - hierarchy[jdLevel])
  }
}
