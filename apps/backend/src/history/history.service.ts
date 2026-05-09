import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { PaginatedScansResponse, ScanDetail } from './history.types'

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name)

  constructor(private readonly prisma: PrismaService) {}

  async getUserScans(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedScansResponse> {
    this.logger.debug(`getUserScans: fetching scans for user ${userId}, page ${page}`)
    const skip = (page - 1) * limit

    try {
      const [total, scans] = await this.prisma.$transaction([
        this.prisma.scan.count({
          where: { userId },
        }),
        this.prisma.scan.findMany({
          where: { userId },
          select: {
            id: true,
            jobTitle: true,
            companyName: true,
            atsScore: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ])

      return {
        data: scans,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error: unknown) {
      this.logger.error(`getUserScans: failed for user ${userId}`, error instanceof Error ? error.stack : String(error))
      throw new InternalServerErrorException(
        'Failed to retrieve scan history. Please try again.',
      )
    }
  }

  async getScanById(
    userId: string,
    scanId: string,
  ): Promise<ScanDetail> {
    this.logger.debug(`getScanById: fetching scan ${scanId} for user ${userId}`)
    try {
      const scan = await this.prisma.scan.findUnique({
        where: { id: scanId },
        select: {
          id: true,
          userId: true,
          jobTitle: true,
          companyName: true,
          atsScore: true,
          topRecommendations: true,
          createdAt: true,
          updatedAt: true,
          keywordResults: {
            select: {
              id: true,
              keyword: true,
              status: true,
              category: true,
            },
            orderBy: { keyword: 'asc' },
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
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!scan) {
        throw new NotFoundException('Scan not found.')
      }

      if (scan.userId !== userId) {
        throw new ForbiddenException('Access denied.')
      }

      const { userId: _, ...scanDetail } = scan
      return scanDetail
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error
      }
      if (error instanceof ForbiddenException) {
        throw error
      }
      this.logger.error(`getScanById: failed for scan ${scanId}`, error instanceof Error ? error.stack : String(error))
      throw new InternalServerErrorException(
        'Failed to retrieve scan. Please try again.',
      )
    }
  }

  async deleteScan(
    userId: string,
    scanId: string,
  ): Promise<{ success: true }> {
    this.logger.debug(`deleteScan: processing deletion of scan ${scanId} by user ${userId}`)

    try {
      const deleted = await this.prisma.scan.deleteMany({
        where: {
          id: scanId,
          userId,
        },
      })

      if (deleted.count === 0) {
        const existingScan = await this.prisma.scan.findUnique({
          where: { id: scanId },
          select: { id: true },
        })

        if (!existingScan) {
          throw new NotFoundException('Scan not found.')
        }

        throw new ForbiddenException('Access denied.')
      }

      this.logger.log(`deleteScan: successfully deleted scan ${scanId}`)
      return { success: true }
    } catch (error: unknown) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error
      }
      this.logger.error(`deleteScan: failed to delete scan ${scanId}`, error instanceof Error ? error.stack : String(error))
      throw new InternalServerErrorException(
        'Failed to delete scan. Please try again.',
      )
    }
  }
}
