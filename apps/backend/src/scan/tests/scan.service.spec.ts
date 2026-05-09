import { Test, TestingModule } from '@nestjs/testing'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { ScanService } from '../scan.service'
import { PrismaService } from '../../prisma/prisma.service'

const mockPrismaService = {
  scan: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
}

const mockScanSummary = {
  id: 'scan-001',
  jobTitle: 'Engineer',
  companyName: 'Acme',
  atsScore: 75,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

const mockScanDetail = {
  id: 'scan-001',
  userId: 'user-123',
  jobTitle: 'Engineer',
  companyName: 'Acme',
  atsScore: 75,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  keywordResults: [{ id: 'kw-1', keyword: 'React', status: 'MATCHED', category: null }],
  bulletEdits: [],
}

describe('ScanService', () => {
  let service: ScanService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScanService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile()

    service = module.get<ScanService>(ScanService)
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a scan with stubbed ATS score', async () => {
      ;(mockPrismaService.scan.create as jest.Mock).mockResolvedValue(mockScanSummary)

      const result = await service.create('user-123', {
        cvText: 'React developer with 5 years experience building web applications',
        jdText: 'Looking for a React developer with web application experience',
      })

      expect(result.id).toBe('scan-001')
      expect(result.atsScore).toBeGreaterThanOrEqual(0)
      expect(result.atsScore).toBeLessThanOrEqual(100)
      expect(mockPrismaService.scan.create).toHaveBeenCalled()
    })
  })

  describe('findAllByUser', () => {
    it('should return paginated scans', async () => {
      ;(mockPrismaService.$transaction as jest.Mock).mockResolvedValue([
        [mockScanSummary],
        1,
      ])

      const result = await service.findAllByUser('user-123', 1, 10)

      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(1)
      expect(result.meta.totalPages).toBe(1)
    })
  })

  describe('findOne', () => {
    it('should return scan detail with keywords and bulletEdits', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue(mockScanDetail)

      const result = await service.findOne('user-123', 'scan-001')

      expect(result.id).toBe('scan-001')
      expect(result.keywordResults).toHaveLength(1)
    })

    it('should throw NotFoundException when scan does not exist', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(service.findOne('user-123', 'missing')).rejects.toThrow(NotFoundException)
    })

    it('should throw ForbiddenException when scan belongs to another user', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue({
        ...mockScanDetail,
        userId: 'other-user',
      })

      await expect(service.findOne('user-123', 'scan-001')).rejects.toThrow(ForbiddenException)
    })
  })

  describe('update', () => {
    it('should update a scan', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue({
        id: 'scan-001',
        userId: 'user-123',
      })
      ;(mockPrismaService.scan.update as jest.Mock).mockResolvedValue({
        ...mockScanSummary,
        jobTitle: 'Senior Engineer',
      })

      const result = await service.update('user-123', 'scan-001', {
        jobTitle: 'Senior Engineer',
      })

      expect(result.jobTitle).toBe('Senior Engineer')
      expect(mockPrismaService.scan.update).toHaveBeenCalledWith({
        where: { id: 'scan-001' },
        data: { jobTitle: 'Senior Engineer' },
        select: {
          id: true,
          jobTitle: true,
          companyName: true,
          atsScore: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    })

    it('should throw NotFoundException when scan does not exist', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        service.update('user-123', 'missing', { jobTitle: 'Test' }),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw ForbiddenException when scan belongs to another user', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue({
        id: 'scan-001',
        userId: 'other-user',
      })

      await expect(
        service.update('user-123', 'scan-001', { jobTitle: 'Test' }),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('remove', () => {
    it('should delete a scan', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue({
        id: 'scan-001',
        userId: 'user-123',
      })
      ;(mockPrismaService.scan.delete as jest.Mock).mockResolvedValue({ id: 'scan-001' })

      const result = await service.remove('user-123', 'scan-001')

      expect(result.message).toBe('Scan deleted successfully')
      expect(mockPrismaService.scan.delete).toHaveBeenCalledWith({
        where: { id: 'scan-001' },
      })
    })

    it('should throw NotFoundException when scan does not exist', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(service.remove('user-123', 'missing')).rejects.toThrow(NotFoundException)
      expect(mockPrismaService.scan.delete).not.toHaveBeenCalled()
    })

    it('should throw ForbiddenException when scan belongs to another user', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue({
        id: 'scan-001',
        userId: 'other-user',
      })

      await expect(service.remove('user-123', 'scan-001')).rejects.toThrow(ForbiddenException)
      expect(mockPrismaService.scan.delete).not.toHaveBeenCalled()
    })
  })
})
