import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import configuration, { validationSchema } from './config'
import { PrismaModule } from './prisma'
import { AuthModule } from './auth'
import { UsersModule } from './users'
import { ScanModule } from './scan'
import { PdfModule } from './pdf'
import { AiModule } from './ai'
import { CvModule } from './cv'
import { HistoryModule } from './history'
import { HealthModule } from './health'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    ScanModule,
    PdfModule,
    AiModule,
    CvModule,
    HistoryModule,
    HealthModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
