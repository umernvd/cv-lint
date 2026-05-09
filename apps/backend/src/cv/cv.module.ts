import { Module } from '@nestjs/common'
import { CvService } from './cv.service'
import { CvController } from './cv.controller'
import { PdfModule } from '../pdf'
import { AiModule } from '../ai'
import { AtsModule } from '../ats'

@Module({
  imports: [PdfModule, AiModule, AtsModule],
  controllers: [CvController],
  providers: [CvService],
  exports: [CvService],
})
export class CvModule {}
