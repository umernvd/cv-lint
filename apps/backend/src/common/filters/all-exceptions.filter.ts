import {
  Catch,
  HttpException,
  HttpStatus,
  ExceptionFilter,
  ArgumentsHost,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

type ErrorResponseBody = {
  success: false
  statusCode: number
  message: string
  timestamp: string
  path: string
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error'

    this.logger.error(
      `${statusCode} ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    )

    const body: ErrorResponseBody = {
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    }

    response.status(statusCode).json(body)
  }
}
