import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { HealthService } from './health.service'

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  }

  @Get('ai')
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  async getAiHealth(): Promise<{
    status: string
    timestamp: string
    providers: Array<{
      provider: string
      status: 'healthy' | 'unhealthy'
      latencyMs: number | null
      error: string | null
    }>
  }> {
    const [gemini, groq] = await Promise.all([
      this.healthService.checkGemini(),
      this.healthService.checkGroq(),
    ])

    const providers = [gemini, groq]
    const anyHealthy = providers.some((p) => p.status === 'healthy')

    return {
      status: anyHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      providers,
    }
  }
}
