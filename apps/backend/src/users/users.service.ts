import {
  Injectable,
  ConflictException,
  Logger,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { User } from '@prisma/client'
import { SafeUser } from '../common/types'
import { SignUpDto } from '../auth/dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      return this.prisma.user.findUnique({
        where: { email },
      })
    } catch (error) {
      this.logger.error(`Failed to find user by email: ${email}`, error)
      throw error
    }
  }

  async findById(id: string): Promise<SafeUser | null> {
    try {
      return this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    } catch (error) {
      this.logger.error(`Failed to find user by id: ${id}`, error)
      throw error
    }
  }

  async create(dto: SignUpDto): Promise<SafeUser> {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 12)

      return this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Email already in use')
      }
      this.logger.error('Failed to create user', error)
      throw error
    }
  }
}
