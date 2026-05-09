import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AllExceptionsFilter, HttpExceptionFilter } from './common/filters'
import { ResponseTransformInterceptor } from './common/interceptors'

const logger = new Logger('Bootstrap')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({ origin: 'http://localhost:3000', credentials: true })
  app.use(helmet())
  app.use(cookieParser())
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter())
  app.useGlobalInterceptors(new ResponseTransformInterceptor())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  app.setGlobalPrefix('/api/v1')

  const config = new DocumentBuilder()
    .setTitle('CV Lint API')
    .setDescription('ATS Resume Analyzer API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(5000)
}

bootstrap().catch((err: Error) => {
  logger.error('Startup error', err.message)
  process.exit(1)
})
