import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Response } from 'express'

export type TransformedResponse<T> = {
  success: true
  statusCode: number
  data: T
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, TransformedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformedResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        statusCode: context.switchToHttp().getResponse<Response>().statusCode,
        data,
      })),
    )
  }
}
