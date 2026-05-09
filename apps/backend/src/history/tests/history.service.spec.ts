import { Test, TestingModule } from '@nestjs/testing'
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { HistoryService } from '../history.service'
import { PrismaService } from '../../prisma/prisma.service'

const mockPrismaService = {
  scan: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
}

const mockScanSummary = {
  id: 'scan-cuid-001',
  jobTitle: 'Senior Software Engineer',
  companyName: 'Acme Corp',
  atsScore: 78,
  createdAt: new Date('2026-05-01T10:00:00Z'),
}

const mockScanDetail = {
  id: 'scan-cuid-001',
  userId: 'user-cuid-456',
  jobTitle: 'Senior Software Engineer',
  companyName: 'Acme Corp',
  atsScore: 78,
  createdAt: new Date('2026-05-01T10:00:00Z'),
  updatedAt: new Date('2026-05-01T10:00:00Z'),
  keywordResults: [
    {
      id: 'kw-001',
      keyword: 'TypeScript',
      status: 'MATCHED',
      category: null,
    },
    {
      id: 'kw-002',
      keyword: 'Docker',
      status: 'MISSING',
      category: null,
    },
  ],
  bulletEdits: [
    {
      id: 'be-001',
      originalText: 'Managed team projects',
      suggestedText:
        'Led cross-functional team delivering 3 projects on time',
      acceptedText: null,
      wasAccepted: false,
      createdAt: new Date('2026-05-01T10:05:00Z'),
    },
  ],
}

describe('HistoryService', () => {
  let service: HistoryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile()

    service = module.get<HistoryService>(HistoryService)

    jest.clearAllMocks()
  })

  describe('getUserScans', () => {
    it('should return paginated scan list successfully', async () => {
      ;(mockPrismaService.$transaction as jest.Mock).mockResolvedValue([
        3,
        [mockScanSummary],
      ])

      const result = await service.getUserScans('user-cuid-456', 1, 20)

      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe('scan-cuid-001')
      expect(result.total).toBe(3)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.totalPages).toBe(1)
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1)
      expect(result.data[0]).not.toHaveProperty('cvText')
      expect(result.data[0]).not.toHaveProperty('jdText')
    })

    it('should calculate pagination correctly for page 2 with limit 2 over 5 total', async () => {
      ;(mockPrismaService.$transaction as jest.Mock).mockResolvedValue([
        5,
        [mockScanSummary],
      ])

      const result = await service.getUserScans('user-cuid-456', 2, 2)

      expect(result.total).toBe(5)
      expect(result.page).toBe(2)
      expect(result.limit).toBe(2)
      expect(result.totalPages).toBe(3)
    })

    it('should return empty history when user has no scans', async () => {
      ;(mockPrismaService.$transaction as jest.Mock).mockResolvedValue([
        0,
        [],
      ])

      const result = await service.getUserScans('user-cuid-456', 1, 20)

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(0)
    })
  })

  describe('getScanById', () => {
    it('should return scan detail without userId', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue(
        mockScanDetail,
      )

      const result = await service.getScanById(
        'user-cuid-456',
        'scan-cuid-001',
      )

      expect(result.id).toBe('scan-cuid-001')
      expect(result.keywordResults).toHaveLength(2)
      expect(result.bulletEdits).toHaveLength(1)
      expect(result).not.toHaveProperty('userId')
      expect(result).not.toHaveProperty('cvText')
      expect(result).not.toHaveProperty('jdText')
    })

    it('should throw NotFoundException when scan is not found', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        service.getScanById('user-cuid-456', 'nonexistent-id'),
      ).rejects.toThrow(NotFoundException)

      await expect(
        service.getScanById('user-cuid-456', 'nonexistent-id'),
      ).rejects.toThrow('not found')
    })

    it('should throw ForbiddenException when scan belongs to different user', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue({
        ...mockScanDetail,
        userId: 'other-user-999',
      })

      await expect(
        service.getScanById('user-cuid-456', 'scan-cuid-001'),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('deleteScan', () => {
    it('should delete scan successfully', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue({
        userId: 'user-cuid-456',
      })
      ;(mockPrismaService.scan.delete as jest.Mock).mockResolvedValue({
        id: 'scan-cuid-001',
      })

      const result = await service.deleteScan(
        'user-cuid-456',
        'scan-cuid-001',
      )

      expect(result.success).toBe(true)
      expect(mockPrismaService.scan.findUnique).toHaveBeenCalledWith({
        where: { id: 'scan-cuid-001' },
        select: { userId: true },
      })
      expect(mockPrismaService.scan.delete).toHaveBeenCalledWith({
        where: { id: 'scan-cuid-001' },
      })
    })

    it('should throw NotFoundException before delete when scan does not exist', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        service.deleteScan('user-cuid-456', 'nonexistent-id'),
      ).rejects.toThrow(NotFoundException)

      expect(mockPrismaService.scan.delete).not.toHaveBeenCalled()
    })

    it('should throw ForbiddenException when scan belongs to different user', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue({
        userId: 'other-user-999',
      })

      await expect(
        service.deleteScan('user-cuid-456', 'scan-cuid-001'),
      ).rejects.toThrow(ForbiddenException)

      expect(mockPrismaService.scan.delete).not.toHaveBeenCalled()
    })
  })
})
