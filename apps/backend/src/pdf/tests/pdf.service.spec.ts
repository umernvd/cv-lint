import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException } from '@nestjs/common'
import { PdfService } from '../pdf.service'
import { extractText } from 'unpdf'

jest.mock('unpdf')

const mockExtractText = extractText as jest.MockedFunction<typeof extractText>

describe('PdfService', () => {
  let service: PdfService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfService],
    }).compile()

    service = module.get<PdfService>(PdfService)

    jest.clearAllMocks()
  })

  describe('extractTextFromBuffer', () => {
    it('should return cleaned text from a normal readable PDF', async () => {
      mockExtractText.mockResolvedValue({
        text: 'John Doe\nSoftware Engineer\nSkills: TypeScript, NestJS, React, Node.js, PostgreSQL, Docker, Kubernetes, CI/CD, Agile, Testing, Git',
        totalPages: 1,
      })

      const result = await service.extractTextFromBuffer(Buffer.from('fake-pdf'))

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
      expect(result).toBe(result.trim())
    })

    it('should collapse 3 or more consecutive newlines into exactly 2', async () => {
      mockExtractText.mockResolvedValue({
        text: 'Line one\n\n\n\n\nLine two\n\n\n\nMore content here that is long enough to pass the minimum character requirement for this test case to work',
        totalPages: 1,
      })

      const result = await service.extractTextFromBuffer(Buffer.from('fake-pdf'))

      expect(result).not.toMatch(/\n{3,}/)
      expect(result).toContain('Line one\n\nLine two')
    })

    it('should remove non-printable garbage characters', async () => {
      mockExtractText.mockResolvedValue({
        text: 'Hello\x00World\x01Test This is a long enough string of text that will pass the minimum fifty character length requirement for the validation',
        totalPages: 1,
      })

      const result = await service.extractTextFromBuffer(Buffer.from('fake-pdf'))

      expect(result).toContain('Hello World Test')
      expect(result).not.toMatch(/[^\x20-\x7E\n\r\t]/)
    })

    it('should throw BadRequestException when PDF has barely any text', async () => {
      mockExtractText.mockResolvedValue({
        text: 'Hi',
        totalPages: 1,
      })

      await expect(
        service.extractTextFromBuffer(Buffer.from('fake-pdf')),
      ).rejects.toThrow(BadRequestException)

      await expect(
        service.extractTextFromBuffer(Buffer.from('fake-pdf')),
      ).rejects.toThrow('Could not extract readable text')
    })

    it('should throw BadRequestException when library returns empty string', async () => {
      mockExtractText.mockResolvedValue({
        text: '',
        totalPages: 1,
      })

      await expect(
        service.extractTextFromBuffer(Buffer.from('fake-pdf')),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException when library itself throws an error', async () => {
      mockExtractText.mockRejectedValue(new Error('Invalid PDF structure'))

      await expect(
        service.extractTextFromBuffer(Buffer.from('fake-pdf')),
      ).rejects.toThrow(BadRequestException)

      await expect(
        service.extractTextFromBuffer(Buffer.from('fake-pdf')),
      ).rejects.toThrow('Failed to read this PDF file')
    })

    it('should throw BadRequestException when PDF contains only whitespace', async () => {
      mockExtractText.mockResolvedValue({
        text: '     \n\n\n   ',
        totalPages: 1,
      })

      await expect(
        service.extractTextFromBuffer(Buffer.from('fake-pdf')),
      ).rejects.toThrow(BadRequestException)
    })
  })
})
