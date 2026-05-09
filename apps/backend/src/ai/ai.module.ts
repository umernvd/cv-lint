import { Module } from '@nestjs/common'
import { GeminiProvider } from './providers/gemini.provider'
import { GroqProvider } from './providers/groq.provider'
import { AiService } from './ai.service'

@Module({
  providers: [GeminiProvider, GroqProvider, AiService],
  exports: [AiService, GeminiProvider, GroqProvider],
})
export class AiModule {}
