import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Groq from 'groq-sdk'
import { IAiProvider } from '../interfaces/ai-provider.interface'

@Injectable()
export class GroqProvider implements IAiProvider {
  readonly name = 'Groq'
  private readonly logger = new Logger(GroqProvider.name)
  private readonly client: Groq

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY')
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured')
    }

    const timeoutMs = this.configService.get<number>('AI_TIMEOUT_MS') ?? 30000

    this.client = new Groq({
      apiKey,
      timeout: timeoutMs,
    })

    this.logger.log('Groq provider initialized')
  }

  async generateText(prompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.1,
    })

    const text = completion.choices[0]?.message?.content ?? ''

    if (!text || text.trim().length === 0) {
      throw new Error('Groq returned empty response')
    }

    this.logger.debug('Groq generated text successfully')
    return text.trim()
  }
}
