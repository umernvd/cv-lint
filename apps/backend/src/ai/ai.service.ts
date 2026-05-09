import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common'
import { GeminiProvider } from './providers/gemini.provider'
import { GroqProvider } from './providers/groq.provider'
import { AtsAnalysisResult } from './interfaces/ai-provider.interface'

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)
  private readonly maxRetries = 2
  private readonly retryDelayMs = 1000

  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly groqProvider: GroqProvider,
  ) {}

  async analyzeWithFallback(prompt: string): Promise<string> {
    let lastGeminiError: unknown

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          this.logger.warn(`Gemini retry attempt ${attempt}/${this.maxRetries}`)
          await this.delay(this.retryDelayMs * (attempt - 1))
        }

        const response = await this.geminiProvider.generateText(prompt)
        this.logger.debug('Gemini response received')
        return response
      } catch (error: unknown) {
        lastGeminiError = error

        if (this.isRetryableError(error)) {
          this.logger.warn(
            `Gemini failed on attempt ${attempt}: ${this.extractErrorMessage(error)}`,
          )
          continue
        }

        this.logger.error('Gemini error occurred', error)
        break
      }
    }

    this.logger.warn('All Gemini attempts exhausted, falling back to Groq')

    try {
      const response = await this.groqProvider.generateText(prompt)
      this.logger.debug('Groq fallback successful')
      return response
    } catch (fallbackError: unknown) {
      this.logger.error('Both AI providers failed', fallbackError)
      throw new ServiceUnavailableException(
        'Our AI service is currently busy. Please try again in a moment.',
      )
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
  }

  parseJsonResponse<T>(rawText: string): T {
    let cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    try {
      return JSON.parse(cleaned) as T
    } catch {
      // Retry: find first '{' and last '}'
      const firstBrace = cleaned.indexOf('{')
      const lastBrace = cleaned.lastIndexOf('}')

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const extracted = cleaned.substring(firstBrace, lastBrace + 1)
        try {
          return JSON.parse(extracted) as T
        } catch {
        }
      }

      this.logger.error('Failed to parse AI JSON response', rawText)
      throw new InternalServerErrorException(
        'AI returned an unexpected response format. Please try again.',
      )
    }
  }

  validateAtsResult(parsed: unknown): AtsAnalysisResult {
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      this.logger.error('ATS result validation failed', parsed)
      throw new InternalServerErrorException(
        'AI returned an invalid analysis structure. Please try again.',
      )
    }

    const result = parsed as Record<string, unknown>

    if (
      typeof result.atsScore !== 'number' ||
      result.atsScore < 0 ||
      result.atsScore > 100
    ) {
      this.logger.error('ATS result validation failed', parsed)
      throw new InternalServerErrorException(
        'AI returned an invalid analysis structure. Please try again.',
      )
    }

    if (!Array.isArray(result.matchedKeywords)) {
      this.logger.error('ATS result validation failed', parsed)
      throw new InternalServerErrorException(
        'AI returned an invalid analysis structure. Please try again.',
      )
    }

    if (!Array.isArray(result.missingKeywords)) {
      this.logger.error('ATS result validation failed', parsed)
      throw new InternalServerErrorException(
        'AI returned an invalid analysis structure. Please try again.',
      )
    }

    if (!Array.isArray(result.topRecommendations)) {
      this.logger.error('ATS result validation failed', parsed)
      throw new InternalServerErrorException(
        'AI returned an invalid analysis structure. Please try again.',
      )
    }

    if (
      result.jobTitle !== null &&
      typeof result.jobTitle !== 'string'
    ) {
      this.logger.error('ATS result validation failed', parsed)
      throw new InternalServerErrorException(
        'AI returned an invalid analysis structure. Please try again.',
      )
    }

    // Validate scoreBreakdown if present, otherwise provide defaults derived from atsScore
    if (result.scoreBreakdown && typeof result.scoreBreakdown === 'object') {
      const bd = result.scoreBreakdown as Record<string, unknown>
      const breakdownKeys = ['keywordMatch', 'contextualRelevance', 'experienceAlignment', 'educationMatch', 'formatQuality']
      for (const key of breakdownKeys) {
        if (typeof bd[key] !== 'number' || (bd[key] as number) < 0 || (bd[key] as number) > 100) {
          this.logger.warn(`ATS breakdown field ${key} invalid, using defaults`)
          result.scoreBreakdown = this.defaultBreakdown(result.atsScore as number)
          break
        }
      }
    } else {
      result.scoreBreakdown = this.defaultBreakdown(result.atsScore as number)
    }

    return parsed as AtsAnalysisResult
  }

  private defaultBreakdown(atsScore: number): Record<string, number> {
    return {
      keywordMatch: atsScore,
      contextualRelevance: atsScore,
      experienceAlignment: atsScore,
      educationMatch: atsScore,
      formatQuality: atsScore,
    }
  }

  private isRetryableError(error: unknown): boolean {
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      (error as { status: number }).status === 429
    ) {
      return true
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      (error as { statusCode: number }).statusCode === 429
    ) {
      return true
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      const retryablePatterns = [
        '429',
        'rate limit',
        'quota exceeded',
        'resource_exhausted',
        'timed out',
        'timeout',
        'abort',
        'fetch failed',
        'econnrefused',
        'enotfound',
        'econnreset',
        'eai_again',
        'network',
        'socket hang up',
        'getaddrinfo',
        'undici',
        'clienterror',
      ]

      return retryablePatterns.some((pattern) => message.includes(pattern))
    }

    return false
  }
}
