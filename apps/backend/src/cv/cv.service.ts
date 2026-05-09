import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { KeywordStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { PdfService } from '../pdf/pdf.service'
import { AiService } from '../ai/ai.service'
import { AtsService } from '../ats'
import { buildAtsScoringPrompt } from '../ai/prompts/ats-scoring.prompt'
import { buildRewritePrompt } from '../ai/prompts/rewrite.prompt'
import { AtsAnalysisResult, RewriteResult } from '../ai/interfaces'
import { AnalyzeCvDto } from './dto/analyze-cv.dto'
import { RewriteBulletDto } from './dto/rewrite-bullet.dto'
import { AnalysisResponse, RewriteResponse } from './cv.types'

@Injectable()
export class CvService {
  private readonly logger = new Logger(CvService.name)
  private readonly MAX_SCANS_PER_USER = 10

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly aiService: AiService,
    private readonly atsService: AtsService,
  ) {}

  async analyzeCv(
    userId: string,
    file: Express.Multer.File,
    dto: AnalyzeCvDto,
  ): Promise<AnalysisResponse> {
    this.logger.debug(`analyzeCV: processing analysis for user ${userId}`)
    const cvText = await this.pdfService.extractTextFromBuffer(file.buffer)

    let analysisResult: AtsAnalysisResult

    try {
      const prompt = buildAtsScoringPrompt(cvText, dto.jdText)
      const rawResponse = await this.aiService.analyzeWithFallback(prompt)

      const parsed =
        this.aiService.parseJsonResponse<AtsAnalysisResult>(rawResponse)
      analysisResult = this.aiService.validateAtsResult(parsed)
      this.logger.debug('AI analysis succeeded for user ${userId}')
    } catch (error: unknown) {
      this.logger.warn(
        `AI analysis failed, falling back to local ATS engines: ${this.extractError(error)}`,
      )

      try {
        const localResult = await this.atsService.analyze({
          cvText,
          jdText: dto.jdText,
          fileSize: file.size,
        })

        analysisResult = {
          atsScore: localResult.atsScore,
          scoreBreakdown: localResult.scoreBreakdown,
          matchedKeywords: localResult.matchedKeywords,
          missingKeywords: localResult.missingKeywords,
          topRecommendations: localResult.topRecommendations,
          jobTitle: dto.jobTitle ?? localResult.jobTitle,
        }
      } catch (localError: unknown) {
        this.logger.error(
          `Local ATS engines also failed: ${this.extractError(localError)}`,
        )
        throw new ServiceUnavailableException(
          'Our AI service is currently busy. Please try again in a moment.',
        )
      }
    }

    const verifiedMatched: string[] = []
    const verifiedMissing: string[] = []

    for (const keyword of [...analysisResult.matchedKeywords, ...analysisResult.missingKeywords]) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b${escaped}\\b`, 'i')
      if (regex.test(cvText)) {
        verifiedMatched.push(keyword)
      } else {
        verifiedMissing.push(keyword)
      }
    }

    const jdLower = dto.jdText.toLowerCase()
    const jdKeywordSet = new Set<string>()

    for (const keyword of [...verifiedMatched, ...verifiedMissing]) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      if (new RegExp(`\\b${escaped}\\b`, 'i').test(jdLower)) {
        jdKeywordSet.add(keyword.toLowerCase())
      }
    }

    const jdKeywordsLower = jdKeywordSet.size > 0
      ? jdKeywordSet
      : [...verifiedMatched, ...verifiedMissing].map((k) => k.toLowerCase())

    const finalMatched: string[] = []
    const finalMissing: string[] = []

    for (const keywordLower of jdKeywordsLower) {
      const escaped = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      if (new RegExp(`\\b${escaped}\\b`, 'i').test(cvText)) {
        const original = [...verifiedMatched, ...verifiedMissing].find(
          (k) => k.toLowerCase() === keywordLower,
        )
        finalMatched.push(original ?? keywordLower)
      } else {
        const original = [...verifiedMatched, ...verifiedMissing].find(
          (k) => k.toLowerCase() === keywordLower,
        )
        finalMissing.push(original ?? keywordLower)
      }
    }

    const totalKeywords = finalMatched.length + finalMissing.length
    const keywordMatchRate = totalKeywords > 0 ? (finalMatched.length / totalKeywords) * 100 : 0

    const aiContextual = analysisResult.scoreBreakdown?.contextualRelevance ?? keywordMatchRate

    const correctedAtsScore = Math.round(
      (keywordMatchRate * 0.7) + (aiContextual * 0.3)
    )

    const correctedBreakdown = {
      keywordMatch: Math.round(keywordMatchRate),
      contextualRelevance: Math.round(aiContextual),
      experienceAlignment: Math.round(keywordMatchRate * 0.7),
      educationMatch: analysisResult.scoreBreakdown?.educationMatch ?? 70,
      formatQuality: analysisResult.scoreBreakdown?.formatQuality ?? 80,
    }

    const keywordResultsData = [
      ...finalMatched.map((keyword) => ({
        keyword,
        status: KeywordStatus.MATCHED,
      })),
      ...finalMissing.map((keyword) => ({
        keyword,
        status: KeywordStatus.MISSING,
      })),
    ]

    let scan: {
      id: string
      jobTitle: string | null
      companyName: string | null
    }

    try {
      const scanCount = await this.prisma.scan.count({
        where: { userId },
      })

      if (scanCount >= this.MAX_SCANS_PER_USER) {
        this.logger.debug(`analyzeCV: user ${userId} at scan limit, removing oldest scan`)
        const oldestScan = await this.prisma.scan.findFirst({
          where: { userId },
          orderBy: { createdAt: 'asc' },
          select: { id: true },
        })

        if (oldestScan) {
          await this.prisma.scan.delete({
            where: { id: oldestScan.id },
          })
        }
      }

      const [createdScan] = await this.prisma.$transaction([
        this.prisma.scan.create({
          data: {
            userId,
            atsScore: correctedAtsScore,
            cvText,
            jdText: dto.jdText,
            jobTitle: dto.jobTitle ?? analysisResult.jobTitle,
            companyName: dto.companyName ?? null,
            topRecommendations: analysisResult.topRecommendations,
            keywordResults: {
              create: keywordResultsData,
            },
          },
          include: {
            keywordResults: true,
          },
        }),
      ])

      scan = createdScan
    } catch (error: unknown) {
      this.logger.error(`analyzeCV: failed to save scan for user ${userId}`, error instanceof Error ? error.stack : String(error))
      throw new InternalServerErrorException(
        'Analysis completed but failed to save results. Please try again.',
      )
    }

    return {
      scanId: scan.id,
      atsScore: correctedAtsScore,
      scoreBreakdown: correctedBreakdown,
      matchedKeywords: finalMatched,
      missingKeywords: finalMissing,
      topRecommendations: analysisResult.topRecommendations,
      jobTitle: scan.jobTitle,
      companyName: scan.companyName,
      cvText,
      jdText: dto.jdText,
      bullets: [],
    }
  }

  async rewriteBullet(
    userId: string,
    dto: RewriteBulletDto,
  ): Promise<RewriteResponse> {
    this.logger.debug(`rewriteBullet: processing for scan ${dto.scanId} by user ${userId}`)
    let scan: {
      id: string
      userId: string
      keywordResults: Array<{ keyword: string }>
    } | null

    try {
      scan = await this.prisma.scan.findUnique({
        where: { id: dto.scanId },
        include: {
          keywordResults: {
            where: { status: KeywordStatus.MISSING },
            select: { keyword: true },
          },
        },
      })
    } catch (error: unknown) {
      this.logger.error(`rewriteBullet: failed to fetch scan ${dto.scanId}`, error instanceof Error ? error.stack : String(error))
      throw new InternalServerErrorException('Failed to retrieve scan data.')
    }

    if (!scan) {
      throw new NotFoundException('Scan not found.')
    }

    if (scan.userId !== userId) {
      throw new ForbiddenException('Access denied.')
    }

    const missingKeywords = scan.keywordResults.map((kr) => kr.keyword)

    const prompt = buildRewritePrompt(
      dto.bulletText,
      dto.jdText,
      missingKeywords,
    )

    const rawResponse = await this.aiService.analyzeWithFallback(prompt)

    const parsed =
      this.aiService.parseJsonResponse<RewriteResult>(rawResponse)

    if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
      throw new InternalServerErrorException(
        'AI returned an invalid rewrite response. Please try again.',
      )
    }

    const suggestions = parsed.suggestions.slice(0, 3)

    let bulletEdit: { id: string }

    try {
      bulletEdit = await this.prisma.bulletEdit.create({
        data: {
          scanId: dto.scanId,
          originalText: dto.bulletText,
          suggestedText: suggestions[0]?.text ?? null,
          wasAccepted: false,
        },
      })
    } catch (error: unknown) {
      this.logger.error(`rewriteBullet: failed to save bullet edit for scan ${dto.scanId}`, error instanceof Error ? error.stack : String(error))
      throw new InternalServerErrorException(
        'Rewrite completed but failed to save. Please try again.',
      )
    }

    return {
      bulletEditId: bulletEdit.id,
      suggestions,
    }
  }

  private extractError(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
  }
}
