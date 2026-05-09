import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateScanDto } from './dto/create-scan.dto'
import { UpdateScanDto } from './dto/update-scan.dto'

@Injectable()
export class ScanService {
  private readonly logger = new Logger(ScanService.name)

  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateScanDto,
  ): Promise<{
    id: string
    jobTitle: string | null
    companyName: string | null
    atsScore: number
    createdAt: Date
    updatedAt: Date
  }> {
    try {
      const atsScore = this.calculateStubbedAtsScore(dto.cvText, dto.jdText)

      const scan = await this.prisma.scan.create({
        data: {
          userId,
          jobTitle: dto.jobTitle,
          companyName: dto.companyName,
          cvText: dto.cvText,
          jdText: dto.jdText,
          atsScore,
        },
        select: {
          id: true,
          jobTitle: true,
          companyName: true,
          atsScore: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      this.logger.log(`Scan created for user ${userId}: ${scan.id}`)
      return scan
    } catch (error: unknown) {
      this.logger.error('Failed to create scan', error)
      throw new InternalServerErrorException('Failed to create scan')
    }
  }

  async findAllByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Array<{
      id: string
      jobTitle: string | null
      companyName: string | null
      atsScore: number
      createdAt: Date
    }>
    meta: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }> {
    try {
      const skip = (page - 1) * limit
      const [scans, total] = await this.prisma.$transaction([
        this.prisma.scan.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            jobTitle: true,
            companyName: true,
            atsScore: true,
            createdAt: true,
          },
        }),
        this.prisma.scan.count({ where: { userId } }),
      ])

      return {
        data: scans,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error: unknown) {
      this.logger.error('Failed to retrieve scans', error)
      throw new InternalServerErrorException('Failed to retrieve scans')
    }
  }

  async findOne(
    userId: string,
    scanId: string,
  ): Promise<{
    id: string
    jobTitle: string | null
    companyName: string | null
    atsScore: number
    createdAt: Date
    updatedAt: Date
    keywordResults: Array<{
      id: string
      keyword: string
      status: string
      category: string | null
    }>
    bulletEdits: Array<{
      id: string
      originalText: string
      suggestedText: string | null
      acceptedText: string | null
      wasAccepted: boolean
      createdAt: Date
    }>
  }> {
    try {
      const scan = await this.prisma.scan.findUnique({
        where: { id: scanId },
        include: {
          keywordResults: {
            select: {
              id: true,
              keyword: true,
              status: true,
              category: true,
            },
          },
          bulletEdits: {
            select: {
              id: true,
              originalText: true,
              suggestedText: true,
              acceptedText: true,
              wasAccepted: true,
              createdAt: true,
            },
          },
        },
      })

      if (!scan) {
        throw new NotFoundException('Scan not found.')
      }

      if (scan.userId !== userId) {
        throw new ForbiddenException('Access denied.')
      }

      return scan
    } catch (error: unknown) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error
      }
      this.logger.error('Failed to retrieve scan', error)
      throw new InternalServerErrorException('Failed to retrieve scan')
    }
  }

  async update(
    userId: string,
    scanId: string,
    dto: UpdateScanDto,
  ): Promise<{
    id: string
    jobTitle: string | null
    companyName: string | null
    atsScore: number
    createdAt: Date
    updatedAt: Date
  }> {
    try {
      const existing = await this.prisma.scan.findUnique({
        where: { id: scanId },
      })

      if (!existing) {
        throw new NotFoundException('Scan not found.')
      }

      if (existing.userId !== userId) {
        throw new ForbiddenException('Access denied.')
      }

      const updated = await this.prisma.scan.update({
        where: { id: scanId },
        data: dto,
        select: {
          id: true,
          jobTitle: true,
          companyName: true,
          atsScore: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      this.logger.log(`Scan updated: ${scanId}`)
      return updated
    } catch (error: unknown) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error
      }
      this.logger.error('Failed to update scan', error)
      throw new InternalServerErrorException('Failed to update scan')
    }
  }

  async remove(
    userId: string,
    scanId: string,
  ): Promise<{ message: string }> {
    try {
      const existing = await this.prisma.scan.findUnique({
        where: { id: scanId },
      })

      if (!existing) {
        throw new NotFoundException('Scan not found.')
      }

      if (existing.userId !== userId) {
        throw new ForbiddenException('Access denied.')
      }

      await this.prisma.scan.delete({
        where: { id: scanId },
      })

      this.logger.log(`Scan deleted: ${scanId}`)
      return { message: 'Scan deleted successfully' }
    } catch (error: unknown) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error
      }
      this.logger.error('Failed to delete scan', error)
      throw new InternalServerErrorException('Failed to delete scan')
    }
  }

  private calculateStubbedAtsScore(cvText: string, jdText: string): number {
    const cvWords = cvText.toLowerCase().split(/\s+/)
    const jdWords = jdText.toLowerCase().split(/\s+/)
    const cvSet = new Set(cvWords)
    const jdSet = new Set(jdWords)

    let matchCount = 0
    for (const word of jdSet) {
      if (cvSet.has(word)) {
        matchCount++
      }
    }

    const rawScore = jdSet.size > 0 ? (matchCount / jdSet.size) * 100 : 0
    return Math.min(100, Math.round(rawScore))
  }
}
