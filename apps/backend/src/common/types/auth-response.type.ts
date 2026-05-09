import { User } from '@prisma/client'

export type SafeUser = Omit<User, 'password'>

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: SafeUser
  accessToken: string
}
