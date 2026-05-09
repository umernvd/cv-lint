import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../users/users.service'
import { SignUpDto } from './dto/sign-up.dto'
import { SignInDto } from './dto/sign-in.dto'
import { SafeUser, AuthTokens, AuthResponse } from '../common/types'
import { JwtPayload } from '../common/types'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(dto: SignUpDto): Promise<SafeUser> {
    this.logger.debug(`signUp: processing registration for ${dto.email}`)
    try {
      const existingUser = await this.usersService.findByEmail(dto.email)

      if (existingUser) {
        throw new ConflictException('An account with this email already exists')
      }

      const user = await this.usersService.create(dto)

      return user
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error
      }
      this.logger.error(`signUp: failed for ${dto.email}`, error instanceof Error ? error.stack : String(error))
      throw error
    }
  }

  async signUpAndLogin(dto: SignUpDto): Promise<AuthResponse & { refreshToken: string }> {
    this.logger.debug(`signUpAndLogin: processing registration for ${dto.email}`)
    const user = await this.signUp(dto)
    const tokens = this.generateTokens(user.id, user.email)
    return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
  }

  async signIn(
    dto: SignInDto,
  ): Promise<AuthResponse & { refreshToken: string }> {
    this.logger.debug(`signIn: processing authentication for ${dto.email}`)
    try {
      const user = await this.usersService.findByEmail(dto.email)

      if (!user) {
        throw new UnauthorizedException('Invalid email or password')
      }

      const isMatch = await bcrypt.compare(dto.password, user.password)

      if (!isMatch) {
        throw new UnauthorizedException('Invalid email or password')
      }

      const tokens = this.generateTokens(user.id, user.email)

      const { password: _password, ...safeUser } = user

      return {
        user: safeUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      this.logger.error(`signIn: failed for ${dto.email}`, error instanceof Error ? error.stack : String(error))
      throw error
    }
  }

  async validateUser(id: string): Promise<SafeUser | null> {
    try {
      return this.usersService.findById(id)
    } catch (error) {
      this.logger.error(`validateUser: failed for id ${id}`, error instanceof Error ? error.stack : String(error))
      throw error
    }
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    this.logger.debug('refreshToken: processing token refresh request')
    try {
      let payload: JwtPayload

      try {
        payload = this.jwtService.verify(refreshToken, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        })
      } catch {
        throw new UnauthorizedException('Invalid or expired refresh token')
      }

      const user = await this.usersService.findById(payload.sub)

      if (!user) {
        throw new UnauthorizedException('User not found')
      }

      const tokens = this.generateTokens(user.id, user.email)

      return {
        accessToken: tokens.accessToken,
        newRefreshToken: tokens.refreshToken,
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      this.logger.error('refreshToken: failed to refresh token', error instanceof Error ? error.stack : String(error))
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  private generateTokens(userId: string, email: string): AuthTokens {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
      },
    )

    const refreshToken = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      },
    )

    return { accessToken, refreshToken }
  }
}
