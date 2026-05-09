import { Test, TestingModule } from '@nestjs/testing'
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { CvService } from '../cv.service'
import { PrismaService } from '../../prisma/prisma.service'
import { PdfService } from '../../pdf/pdf.service'
import { AiService } from '../../ai/ai.service'
import { AtsService } from '../../ats'
import { AnalyzeCvDto } from '../dto/analyze-cv.dto'
import { RewriteBulletDto } from '../dto/rewrite-bullet.dto'
import { AtsAnalysisResult, RewriteResult } from '../../ai/interfaces'
import { Readable } from 'stream'

const mockPrismaService = {
  scan: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  bulletEdit: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
}

const mockPdfService = {
  extractTextFromBuffer: jest.fn(),
}

const mockAiService = {
  analyzeWithFallback: jest.fn(),
  parseJsonResponse: jest.fn(),
  validateAtsResult: jest.fn(),
}

const mockAtsService = {
  analyze: jest.fn(),
}

const mockFile: Express.Multer.File = {
  buffer: Buffer.from('fake-pdf-content'),
  mimetype: 'application/pdf',
  size: 1024,
  originalname: 'resume.pdf',
  fieldname: 'cv',
  encoding: '7bit',
  stream: new Readable(),
  destination: '',
  filename: '',
  path: '',
}

const mockAtsResult: AtsAnalysisResult = {
  atsScore: 78,
  scoreBreakdown: {
    keywordMatch: 80,
    contextualRelevance: 75,
    experienceAlignment: 85,
    educationMatch: 70,
    formatQuality: 72,
  },
  matchedKeywords: ['TypeScript', 'NestJS', 'PostgreSQL'],
  missingKeywords: ['Docker', 'Kubernetes'],
  topRecommendations: ['Add Docker experience', 'Mention Kubernetes'],
  jobTitle: 'Senior Software Engineer',
}

const mockScan = {
  id: 'scan-cuid-123',
  userId: 'user-cuid-456',
  atsScore: 78,
  jobTitle: 'Senior Software Engineer',
  companyName: null,
  cvText: 'John Doe Software Engineer...',
  jdText: 'We are looking for a Senior Software Engineer...',
  keywordResults: [
    { keyword: 'Docker', status: 'MISSING' },
    { keyword: 'Kubernetes', status: 'MISSING' },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('CvService', () => {
  let service: CvService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
        providers: [
        CvService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PdfService, useValue: mockPdfService },
        { provide: AiService, useValue: mockAiService },
        { provide: AtsService, useValue: mockAtsService },
      ],
    }).compile()

    service = module.get<CvService>(CvService)

    jest.clearAllMocks()
  })

  describe('analyzeCv', () => {
    it('should complete full analysis flow successfully', async () => {
      const mockScanResult = {
        id: 'new-scan-id',
        jobTitle: 'Senior Engineer',
        companyName: 'Acme Corp',
      }

      ;(mockPdfService.extractTextFromBuffer as jest.Mock).mockResolvedValue(
        'Long CV text here with enough content to pass the minimum length requirement for testing purposes',
      )
      ;(mockAiService.analyzeWithFallback as jest.Mock).mockResolvedValue(
        '{"atsScore":78}',
      )
      ;(mockAiService.parseJsonResponse as jest.Mock).mockReturnValue(
        mockAtsResult,
      )
      ;(mockAiService.validateAtsResult as jest.Mock).mockReturnValue(
        mockAtsResult,
      )
      ;(mockPrismaService.$transaction as jest.Mock).mockResolvedValue([
        mockScanResult,
      ])

      const dto: AnalyzeCvDto = {
        jdText:
          'We need a senior engineer with 5 years experience in TypeScript and cloud technologies for building scalable applications',
        jobTitle: 'Senior Engineer',
        companyName: 'Acme Corp',
      }

      const result = await service.analyzeCv('user-123', mockFile, dto)

      expect(result.scanId).toBe('new-scan-id')
      expect(result.atsScore).toBe(78)
      expect(result.matchedKeywords).toContain('TypeScript')
      expect(result.missingKeywords).toContain('Docker')
      expect(mockPdfService.extractTextFromBuffer).toHaveBeenCalledWith(
        mockFile.buffer,
      )
      expect(mockAiService.analyzeWithFallback).toHaveBeenCalledTimes(1)
      expect(mockAiService.validateAtsResult).toHaveBeenCalledTimes(1)
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1)
      expect(result).not.toHaveProperty('cvText')
    })

    it('should let PDF extraction failure bubble up correctly', async () => {
      ;(mockPdfService.extractTextFromBuffer as jest.Mock).mockRejectedValue(
        new BadRequestException(
          'Could not extract readable text from this PDF. Please upload a standard text-based PDF, not a scanned image or photo.',
        ),
      )

      const dto: AnalyzeCvDto = {
        jdText:
          'We need a senior engineer with 5 years experience in TypeScript and cloud technologies for building scalable applications',
      }

      await expect(
        service.analyzeCv('user-123', mockFile, dto),
      ).rejects.toThrow(BadRequestException)

      expect(mockAiService.analyzeWithFallback).not.toHaveBeenCalled()
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled()
    })

    it('should fall back to local ATS engines when AI service fails', async () => {
      const localResult = {
        atsScore: 72,
        scoreBreakdown: {
          keywordMatch: 70,
          contextualRelevance: 68,
          experienceAlignment: 80,
          educationMatch: 75,
          formatQuality: 65,
        },
        matchedKeywords: ['TypeScript', 'React'],
        missingKeywords: ['Docker', 'Kubernetes'],
        topRecommendations: ['Add Docker experience'],
        jobTitle: 'Software Engineer',
        companyName: null,
        rawResult: {} as never,
      }

      ;(mockPdfService.extractTextFromBuffer as jest.Mock).mockResolvedValue(
        'Some long CV text here with enough content to pass the minimum length requirement for testing purposes and more text to be safe',
      )
      ;(mockAiService.analyzeWithFallback as jest.Mock).mockRejectedValue(
        new ServiceUnavailableException('AI service busy'),
      )
      ;(mockAtsService.analyze as jest.Mock).mockResolvedValue(localResult)
      ;(mockPrismaService.$transaction as jest.Mock).mockResolvedValue([
        { id: 'new-scan-id', jobTitle: 'Software Engineer', companyName: null },
      ])

      const dto: AnalyzeCvDto = {
        jdText:
          'We need a senior engineer with 5 years experience in TypeScript and cloud technologies for building scalable applications',
      }

      const result = await service.analyzeCv('user-123', mockFile, dto)

      expect(result.scanId).toBe('new-scan-id')
      expect(result.atsScore).toBe(72)
      expect(result.matchedKeywords).toContain('TypeScript')
      expect(result.missingKeywords).toContain('Docker')
      expect(mockAtsService.analyze).toHaveBeenCalledTimes(1)
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1)
    })

    it('should throw ServiceUnavailableException when both AI and local engines fail', async () => {
      ;(mockPdfService.extractTextFromBuffer as jest.Mock).mockResolvedValue(
        'Some long CV text here with enough content to pass the minimum length requirement for testing purposes and more text to be safe',
      )
      ;(mockAiService.analyzeWithFallback as jest.Mock).mockRejectedValue(
        new ServiceUnavailableException('AI service busy'),
      )
      ;(mockAtsService.analyze as jest.Mock).mockRejectedValue(
        new Error('Local analysis failed'),
      )

      const dto: AnalyzeCvDto = {
        jdText:
          'We need a senior engineer with 5 years experience in TypeScript and cloud technologies for building scalable applications',
      }

      await expect(
        service.analyzeCv('user-123', mockFile, dto),
      ).rejects.toThrow(ServiceUnavailableException)

      expect(mockPrismaService.$transaction).not.toHaveBeenCalled()
    })

    it('should throw InternalServerErrorException when database fails', async () => {
      ;(mockPdfService.extractTextFromBuffer as jest.Mock).mockResolvedValue(
        'Some long CV text here with enough content to pass the minimum length requirement for testing purposes and more text to be safe',
      )
      ;(mockAiService.analyzeWithFallback as jest.Mock).mockResolvedValue(
        '{"atsScore":78}',
      )
      ;(mockAiService.parseJsonResponse as jest.Mock).mockReturnValue(
        mockAtsResult,
      )
      ;(mockAiService.validateAtsResult as jest.Mock).mockReturnValue(
        mockAtsResult,
      )
      ;(mockPrismaService.$transaction as jest.Mock).mockRejectedValue(
        new Error('DB connection lost'),
      )

      const dto: AnalyzeCvDto = {
        jdText:
          'We need a senior engineer with 5 years experience in TypeScript and cloud technologies for building scalable applications',
      }

      await expect(
        service.analyzeCv('user-123', mockFile, dto),
      ).rejects.toThrow(InternalServerErrorException)

      await expect(
        service.analyzeCv('user-123', mockFile, dto),
      ).rejects.toThrow('failed to save results')
    })

    it('should use user-provided jobTitle over AI-detected title', async () => {
      const mockScanResult = {
        id: 'new-scan-id',
        jobTitle: 'My Custom Title',
        companyName: 'Acme Corp',
      }

      let capturedJobTitle: string | undefined

      ;(mockPdfService.extractTextFromBuffer as jest.Mock).mockResolvedValue(
        'Some long CV text here with enough content to pass the minimum length requirement for testing purposes and more text to be safe',
      )
      ;(mockAiService.analyzeWithFallback as jest.Mock).mockResolvedValue(
        '{"atsScore":78}',
      )
      ;(mockAiService.parseJsonResponse as jest.Mock).mockReturnValue(
        mockAtsResult,
      )
      ;(mockAiService.validateAtsResult as jest.Mock).mockReturnValue(
        mockAtsResult,
      )
      ;(mockPrismaService.scan.create as jest.Mock).mockImplementation(
        (args: { data: { jobTitle: string } }) => {
          capturedJobTitle = args.data.jobTitle
          return Promise.resolve(mockScanResult)
        },
      )
      ;(mockPrismaService.$transaction as jest.Mock).mockImplementation(
        async (queries: Array<Promise<unknown>>) => {
          return Promise.all(queries)
        },
      )

      const dto: AnalyzeCvDto = {
        jdText:
          'We need a senior engineer with 5 years experience in TypeScript and cloud technologies for building scalable applications',
        jobTitle: 'My Custom Title',
        companyName: 'Acme Corp',
      }

      await service.analyzeCv('user-123', mockFile, dto)

      expect(capturedJobTitle).toBe('My Custom Title')
    })
  })

  describe('rewriteBullet', () => {
    it('should generate rewrite suggestions successfully', async () => {
      const scanWithKeywords = {
        ...mockScan,
        keywordResults: [
          { keyword: 'Docker' },
          { keyword: 'Kubernetes' },
        ],
      }

      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue(
        scanWithKeywords,
      )
      ;(mockAiService.analyzeWithFallback as jest.Mock).mockResolvedValue(
        '{"suggestions":[{"text":"Rewrote it","explanation":"Better"}]}',
      )
      ;(mockAiService.parseJsonResponse as jest.Mock).mockReturnValue({
        suggestions: [{ text: 'Rewrote it', explanation: 'Better' }],
      } as RewriteResult)
      ;(mockPrismaService.bulletEdit.create as jest.Mock).mockResolvedValue({
        id: 'edit-123',
      })

      const dto: RewriteBulletDto = {
        bulletText: 'Managed team projects and deliverables',
        jdText:
          'We need someone with Docker and Kubernetes experience to build cloud infrastructure',
        scanId: 'scan-cuid-123',
      }

      const result = await service.rewriteBullet('user-cuid-456', dto)

      expect(result.bulletEditId).toBe('edit-123')
      expect(result.suggestions.length).toBeGreaterThanOrEqual(1)
      expect(mockAiService.analyzeWithFallback).toHaveBeenCalledTimes(1)

      const promptCall = (
        mockAiService.analyzeWithFallback as jest.Mock
      ).mock.calls[0][0] as string
      expect(promptCall).toContain('Docker')
      expect(promptCall).toContain('Kubernetes')

      const createCall = (
        mockPrismaService.bulletEdit.create as jest.Mock
      ).mock.calls[0][0]
      expect(createCall.data.originalText).toBe(
        'Managed team projects and deliverables',
      )
    })

    it('should throw NotFoundException when scan is not found', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue(null)

      const dto: RewriteBulletDto = {
        bulletText: 'Managed team projects and deliverables',
        jdText:
          'We need someone with Docker and Kubernetes experience to build cloud infrastructure',
        scanId: 'nonexistent-scan',
      }

      await expect(
        service.rewriteBullet('user-cuid-456', dto),
      ).rejects.toThrow(NotFoundException)

      await expect(
        service.rewriteBullet('user-cuid-456', dto),
      ).rejects.toThrow('Scan not found')

      expect(mockAiService.analyzeWithFallback).not.toHaveBeenCalled()
    })

    it('should throw ForbiddenException when scan belongs to different user', async () => {
      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue({
        ...mockScan,
        userId: 'different-user-999',
      })

      const dto: RewriteBulletDto = {
        bulletText: 'Managed team projects and deliverables',
        jdText:
          'We need someone with Docker and Kubernetes experience to build cloud infrastructure',
        scanId: 'scan-cuid-123',
      }

      await expect(
        service.rewriteBullet('user-cuid-456', dto),
      ).rejects.toThrow(ForbiddenException)

      expect(mockAiService.analyzeWithFallback).not.toHaveBeenCalled()
    })

    it('should limit suggestions to maximum 3', async () => {
      const scanWithKeywords = {
        ...mockScan,
        keywordResults: [{ keyword: 'Docker' }],
      }

      const fiveSuggestions = [
        { text: 's1', explanation: 'e1' },
        { text: 's2', explanation: 'e2' },
        { text: 's3', explanation: 'e3' },
        { text: 's4', explanation: 'e4' },
        { text: 's5', explanation: 'e5' },
      ]

      ;(mockPrismaService.scan.findUnique as jest.Mock).mockResolvedValue(
        scanWithKeywords,
      )
      ;(mockAiService.analyzeWithFallback as jest.Mock).mockResolvedValue(
        '{"suggestions":[]}',
      )
      ;(mockAiService.parseJsonResponse as jest.Mock).mockReturnValue({
        suggestions: fiveSuggestions,
      } as RewriteResult)
      ;(mockPrismaService.bulletEdit.create as jest.Mock).mockResolvedValue({
        id: 'edit-123',
      })

      const dto: RewriteBulletDto = {
        bulletText: 'Managed team projects and deliverables',
        jdText:
          'We need someone with Docker and Kubernetes experience to build cloud infrastructure',
        scanId: 'scan-cuid-123',
      }

      const result = await service.rewriteBullet('user-cuid-456', dto)

      expect(result.suggestions.length).toBe(3)
    })
  })
})
