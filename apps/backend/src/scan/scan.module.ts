import { Module } from '@nestjs/common'
import { ScanService } from './scan.service'
import { ScanController } from './scan.controller'
import { PrismaModule } from '../prisma'

@Module({
  imports: [PrismaModule],
  controllers: [ScanController],
  providers: [ScanService],
  exports: [ScanService],
})
export class ScanModule {}
