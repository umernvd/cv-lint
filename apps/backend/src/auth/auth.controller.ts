import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { SignUpDto, SignInDto } from './dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { SafeUser } from '../common/types'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; data: { user: SafeUser; accessToken: string }; message: string }> {
    const result = await this.authService.signUpAndLogin(dto)

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    return {
      success: true,
      data: { user: result.user, accessToken: result.accessToken },
      message: 'Account created successfully',
    }
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({ status: 200, description: 'Signed in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; data: { user: SafeUser; accessToken: string }; message: string }> {
    const result = await this.authService.signIn(dto)

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    return {
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
      message: 'Signed in successfully',
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  @ApiResponse({ status: 200, description: 'Access token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or missing refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; data: { accessToken: string }; message: string }> {
    const refreshToken = req.cookies?.['refresh_token']

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token')
    }

    const result = await this.authService.refreshToken(refreshToken)

    res.cookie('refresh_token', result.newRefreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    return {
      success: true,
      data: {
        accessToken: result.accessToken,
      },
      message: 'Token refreshed successfully',
    }
  }

  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out and clear session' })
  @ApiResponse({ status: 200, description: 'Signed out successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async signOut(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; data: null; message: string }> {
    res.clearCookie('refresh_token', { path: '/' })

    return {
      success: true,
      data: null,
      message: 'Signed out successfully',
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getMe(
    @CurrentUser() user: SafeUser,
  ): Promise<{ success: boolean; data: { user: SafeUser }; message: string }> {
    return {
      success: true,
      data: { user },
      message: 'User profile fetched',
    }
  }
}
