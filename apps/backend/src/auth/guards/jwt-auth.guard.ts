import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | false,
    info: Error | null,
  ): TUser {
    if (info && info.message === 'No auth token') {
      throw new UnauthorizedException('No token provided')
    }

    if (info && info.message === 'jwt expired') {
      throw new UnauthorizedException('Token has expired')
    }

    if (err || !user) {
      throw new UnauthorizedException('Invalid token')
    }

    return user
  }
}
