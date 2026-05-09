import { Injectable, Logger } from '@nestjs/common'
import { KeywordStatus } from '@prisma/client'
import { CVData, JobDescription, ATSAnalysisResult, ScoreBreakdownLocal, KeywordMatch } from './core/types'
import { ATS_CONFIG } from './core/constants'
import { countWords } from './core/utils'
import { SectionParser } from './extractors/section-parser'
import { JobDescriptionParser } from './extractors/jd-parser'
import { KeywordMatchEngine } from './engines/keyword-engine'
import { ContextualAnalysisEngine } from './engines/context-engine'
import { ExperienceAlignmentEngine } from './engines/experience-engine'
import { EducationMatchEngine } from './engines/education-engine'
import { FormatQualityEngine } from './engines/format-engine'
import { ScoreCalculator } from './scorers/score-calculator'
import { RecommendationGenerator } from './scorers/recommendation-generator'
import { AnalysisCache } from './cache/analysis-cache'

export interface LocalAnalysisInput {
  cvText: string
  jdText: string
  fileSize?: number
  pageCount?: number
}

export interface LocalAnalysisOutput {
  atsScore: number
  scoreBreakdown: ScoreBreakdownLocal
  matchedKeywords: string[]
  missingKeywords: string[]
  topRecommendations: string[]
  jobTitle: string | null
  companyName: string | null
  rawResult: ATSAnalysisResult
}

@Injectable()
export class AtsService {
  private readonly logger = new Logger(AtsService.name)
  private readonly cache = new AnalysisCache()

  async analyze(input: LocalAnalysisInput): Promise<LocalAnalysisOutput> {
    const startTime = Date.now()

    const cvData = this.buildCVData(input)
    const jdParsed = new JobDescriptionParser().parse(input.jdText)

    const allJDKeywords = this.extractJDKeywords(jdParsed)

    const [keywordResult, contextResult, experienceResult, educationResult, formatResult] =
      await Promise.all([
        this.runKeywordAnalysis(cvData, allJDKeywords),
        this.runContextualAnalysis(cvData, jdParsed),
        this.runExperienceAnalysis(cvData, jdParsed),
        this.runEducationAnalysis(cvData, jdParsed),
        this.runFormatAnalysis(cvData),
      ])

    const calculator = new ScoreCalculator()
    const score = calculator.calculate(
      { score: keywordResult.score, matched: keywordResult.matched, partial: keywordResult.partial },
      { score: contextResult.score },
      { score: experienceResult.score },
      { score: educationResult.score },
      { score: formatResult.score },
    )

    const allInsights = [
      ...contextResult.insights,
      ...experienceResult.insights,
      ...educationResult.insights,
      ...formatResult.insights,
    ]

    const recGenerator = new RecommendationGenerator()
    const recommendations = recGenerator.generate(
      keywordResult.missing,
      keywordResult.partial,
      allInsights,
      score.overall,
    )

    const processingTime = Date.now() - startTime

    const rawResult: ATSAnalysisResult = {
      score,
      keywords: {
        matched: keywordResult.matched,
        missing: keywordResult.missing,
        partial: keywordResult.partial,
      },
      recommendations,
      metadata: {
        analyzedAt: new Date(),
        processingTime,
        confidence: this.calculateConfidence(score, cvData),
        source: 'local',
      },
    }

    const matchedKeywords = keywordResult.matched.map((kw) => kw.keyword)
    const missingKeywords = [...keywordResult.missing.map((kw) => kw.keyword), ...keywordResult.partial.map((kw) => kw.keyword)]

    const topRecommendations = recommendations.slice(0, 5).map((r) => r.title)

    return {
      atsScore: score.overall,
      scoreBreakdown: score.breakdown,
      matchedKeywords,
      missingKeywords,
      topRecommendations,
      jobTitle: jdParsed.parsed.title ?? null,
      companyName: null,
      rawResult,
    }
  }

  private buildCVData(input: LocalAnalysisInput): CVData {
    const sectionParser = new SectionParser()
    const sections = sectionParser.parse(input.cvText)

    return {
      rawText: input.cvText,
      sections,
      metadata: {
        pageCount: input.pageCount ?? 0,
        wordCount: countWords(input.cvText),
        hasFormatting: input.cvText !== input.cvText.toLowerCase(),
        fileSize: input.fileSize ?? 0,
      },
    }
  }

  private extractJDKeywords(jdParsed: JobDescription): string[] {
    const keywords = [
      ...jdParsed.parsed.skills.technical,
      ...jdParsed.parsed.skills.soft,
    ]

    for (const req of jdParsed.parsed.requirements.required) {
      const phrases = req
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length >= 3 && w.length <= 50)

      for (let n = 1; n <= 3; n++) {
        for (let i = 0; i <= phrases.length - n; i++) {
          keywords.push(phrases.slice(i, i + n).join(' '))
        }
      }
    }

    return Array.from(new Set(keywords)).slice(0, ATS_CONFIG.LIMITS.MAX_KEYWORDS)
  }

  private runKeywordAnalysis(cvData: CVData, jdKeywords: string[]) {
    const engine = new KeywordMatchEngine(cvData.rawText, jdKeywords)
    return engine.analyze()
  }

  private runContextualAnalysis(cvData: CVData, jdParsed: JobDescription) {
    const engine = new ContextualAnalysisEngine(cvData.sections, jdParsed.parsed)
    return engine.analyze()
  }

  private runExperienceAnalysis(cvData: CVData, jdParsed: JobDescription) {
    const engine = new ExperienceAlignmentEngine(
      cvData.sections.experience ?? cvData.rawText,
      jdParsed.parsed.experience,
    )
    return engine.analyze()
  }

  private runEducationAnalysis(cvData: CVData, jdParsed: JobDescription) {
    const engine = new EducationMatchEngine(
      cvData.sections.education ?? '',
      jdParsed.parsed.education,
      cvData.rawText,
    )
    return engine.analyze()
  }

  private runFormatAnalysis(cvData: CVData) {
    const engine = new FormatQualityEngine(cvData)
    return engine.analyze()
  }

  private calculateConfidence(
    score: ATSAnalysisResult['score'],
    cvData: CVData,
  ): number {
    let confidence = 100

    const sectionCount = Object.values(cvData.sections).filter(Boolean).length
    if (sectionCount < 3) confidence -= 20

    if (cvData.metadata.wordCount < 300) confidence -= 15

    if (!cvData.metadata.hasFormatting) confidence -= 10

    if (score.breakdown.keywordMatch < 30) confidence -= 15
    if (score.breakdown.experienceAlignment < 30) confidence -= 10

    return Math.max(0, confidence)
  }
}
