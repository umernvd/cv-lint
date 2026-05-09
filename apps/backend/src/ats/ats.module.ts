import { Module } from '@nestjs/common'
import { AtsService } from './ats.service'

@Module({
  providers: [AtsService],
  exports: [AtsService],
})
export class AtsModule {}
