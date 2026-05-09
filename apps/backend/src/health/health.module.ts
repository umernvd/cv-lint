import { Module } from '@nestjs/common'
import { AiModule } from '../ai'
import { HealthController } from './health.controller'
import { HealthService } from './health.service'

@Module({
  imports: [AiModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
