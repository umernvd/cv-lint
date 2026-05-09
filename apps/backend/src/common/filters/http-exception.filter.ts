import {
  Catch,
  HttpException,
  ExceptionFilter,
  ArgumentsHost,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

type ErrorResponseBody = {
  success: false
  statusCode: number
  message: string | string[]
  timestamp: string
  path: string
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const statusCode = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    let message: string | string[]
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      message = (exceptionResponse as Record<string, unknown>).message as
        | string
        | string[]
    } else {
      message = exception.message
    }

    const body: ErrorResponseBody = {
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    }

    if (statusCode !== 401) {
      this.logger.warn(
        `${statusCode} ${request.method} ${request.url}: ${JSON.stringify(message)}`,
      )
    }

    response.status(statusCode).json(body)
  }
}
