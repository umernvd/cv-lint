import { Injectable, Logger } from '@nestjs/common'
import { GeminiProvider } from '../ai/providers/gemini.provider'
import { GroqProvider } from '../ai/providers/groq.provider'

type ProviderStatus = {
  provider: string
  status: 'healthy' | 'unhealthy'
  latencyMs: number | null
  error: string | null
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)
  private readonly testPrompt = 'Return exactly: {"ok":true}'

  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly groqProvider: GroqProvider,
  ) {}

  async checkGemini(): Promise<ProviderStatus> {
    const start = Date.now()
    try {
      await this.geminiProvider.generateText(this.testPrompt)
      return {
        provider: 'Gemini',
        status: 'healthy',
        latencyMs: Date.now() - start,
        error: null,
      }
    } catch (error: unknown) {
      return {
        provider: 'Gemini',
        status: 'unhealthy',
        latencyMs: null,
        error: this.extractMessage(error),
      }
    }
  }

  async checkGroq(): Promise<ProviderStatus> {
    const start = Date.now()
    try {
      await this.groqProvider.generateText(this.testPrompt)
      return {
        provider: 'Groq',
        status: 'healthy',
        latencyMs: Date.now() - start,
        error: null,
      }
    } catch (error: unknown) {
      return {
        provider: 'Groq',
        status: 'unhealthy',
        latencyMs: null,
        error: this.extractMessage(error),
      }
    }
  }

  private extractMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
  }
}
