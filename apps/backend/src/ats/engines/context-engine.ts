import { CVData, JobDescription, ATSEngineResult } from '../core/types'
import { ATS_CONFIG } from '../core/constants'
import { TextCleaner } from '../extractors/text-cleaner'
import { cosineSimilarity, createTFIDFVector, stringSimilarity } from '../nlp/similarity'

export class ContextualAnalysisEngine {
  private readonly cvSections: CVData['sections']
  private readonly jdParsed: JobDescription['parsed']

  constructor(cvSections: CVData['sections'], jdParsed: JobDescription['parsed']) {
    this.cvSections = cvSections
    this.jdParsed = jdParsed
  }

  analyze(): ATSEngineResult {
    const insights: string[] = []
    let totalScore = 0
    let componentCount = 0

    if (this.cvSections.experience && this.jdParsed.requirements.required.length > 0) {
      const expScore = this.analyzeExperienceContext()
      totalScore += expScore
      componentCount++

      if (expScore < 60) {
        insights.push('Experience section could better highlight relevant responsibilities')
      }
    }

    if (this.cvSections.skills && this.jdParsed.skills.technical.length > 0) {
      const skillScore = this.analyzeSkillsContext()
      totalScore += skillScore
      componentCount++

      if (skillScore < 70) {
        insights.push('Skills section should emphasize technical skills mentioned in job description')
      }
    }

    if (this.cvSections.summary) {
      const summaryScore = this.analyzeSummaryContext()
      totalScore += summaryScore
      componentCount++

      if (summaryScore < 50) {
        insights.push('Professional summary could better align with job requirements')
      }
    }

    if (this.cvSections.certifications && this.jdParsed.skills.technical.length > 0) {
      const certScore = this.analyzeCertificationsContext()
      totalScore += certScore
      componentCount++

      if (certScore < 60) {
        insights.push('Consider highlighting relevant certifications')
      }
    }

    const score = componentCount > 0 ? Math.round(totalScore / componentCount) : 0

    return { score, insights }
  }

  private analyzeExperienceContext(): number {
    const experienceText = this.cvSections.experience || ''
    const requirements = this.jdParsed.requirements.required.join(' ')

    const cvVector = createTFIDFVector(experienceText)
    const jdVector = createTFIDFVector(requirements)

    const similarity = cosineSimilarity(cvVector, jdVector)
    return Math.round(similarity * 100)
  }

  private analyzeSkillsContext(): number {
    const skillsText = this.cvSections.skills || ''
    const requiredSkills = this.jdParsed.skills.technical.join(' ')

    const skillTokens = new TextCleaner().tokenize(skillsText)
    const jdSkillTokens = new TextCleaner().tokenize(requiredSkills)

    const matchCount = jdSkillTokens.filter((jdSkill) =>
      skillTokens.some(
        (cvSkill) => stringSimilarity(jdSkill, cvSkill) > ATS_CONFIG.THRESHOLDS.CONTEXT_RELEVANCE,
      ),
    ).length

    return jdSkillTokens.length > 0
      ? Math.round((matchCount / jdSkillTokens.length) * 100)
      : 0
  }

  private analyzeSummaryContext(): number {
    const summary = this.cvSections.summary || ''
    const jobTitle = this.jdParsed.title || ''

    const summaryLower = summary.toLowerCase()
    const titleWords = jobTitle.toLowerCase().split(/\s+/)

    const relevantMentions = titleWords.filter((word) =>
      word.length > 3 && summaryLower.includes(word),
    ).length

    return titleWords.length > 0
      ? Math.round((relevantMentions / titleWords.length) * 100)
      : 0
  }

  private analyzeCertificationsContext(): number {
    const certText = this.cvSections.certifications || ''
    const techSkills = this.jdParsed.skills.technical

    if (techSkills.length === 0) return 50

    const lower = certText.toLowerCase()
    const relevantCerts = techSkills.filter((skill) => {
      const certifiedVariants = [
        `${skill} certified`,
        `certified ${skill}`,
        `${skill} certification`,
      ]
      return certifiedVariants.some((variant) => lower.includes(variant))
    })

    return Math.round((relevantCerts.length / techSkills.length) * 100)
  }
}
