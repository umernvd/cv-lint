import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { IAiProvider } from '../interfaces/ai-provider.interface'

@Injectable()
export class GeminiProvider implements IAiProvider {
  readonly name = 'Gemini'
  private readonly logger = new Logger(GeminiProvider.name)
  private readonly model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>
  private readonly timeoutMs: number

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    this.timeoutMs = this.configService.get<number>('AI_TIMEOUT_MS') ?? 30000

    this.model = genAI.getGenerativeModel(
      { model: 'gemini-2.5-flash-lite' },
      {
        timeout: this.timeoutMs,
        apiVersion: 'v1beta',
      },
    )

    this.logger.log('Gemini provider initialized')
  }

  async generateText(prompt: string): Promise<string> {
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.timeoutMs,
    )

    try {
      const resultPromise = this.model.generateContent(prompt)
      const result = await Promise.race([
        resultPromise,
        new Promise<never>((_, reject) =>
          controller.signal.addEventListener('abort', () =>
            reject(
              new Error(
                `Gemini request timed out after ${this.timeoutMs}ms`,
              ),
            ),
          ),
        ),
      ])

      clearTimeout(timeoutId)
      const text = result.response.text()

      if (!text || text.trim().length === 0) {
        throw new Error('Gemini returned empty response')
      }

      this.logger.debug('Gemini generated text successfully')
      return text.trim()
    } catch (error: unknown) {
      clearTimeout(timeoutId)
      throw error
    }
  }
}
