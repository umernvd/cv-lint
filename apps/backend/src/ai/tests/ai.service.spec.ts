import { Test, TestingModule } from '@nestjs/testing'
import {
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { AiService } from '../ai.service'
import { GeminiProvider } from '../providers/gemini.provider'
import { GroqProvider } from '../providers/groq.provider'

describe('AiService', () => {
  let service: AiService
  let geminiProvider: GeminiProvider
  let groqProvider: GroqProvider

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: GeminiProvider,
          useValue: {
            generateText: jest.fn(),
            name: 'Gemini',
          },
        },
        {
          provide: GroqProvider,
          useValue: {
            generateText: jest.fn(),
            name: 'Groq',
          },
        },
      ],
    }).compile()

    service = module.get<AiService>(AiService)
    geminiProvider = module.get<GeminiProvider>(GeminiProvider)
    groqProvider = module.get<GroqProvider>(GroqProvider)

    jest.clearAllMocks()
  })

  describe('analyzeWithFallback', () => {
    it('should return Gemini response when it succeeds on first try', async () => {
      const geminiResponse = '{"atsScore": 75, "matchedKeywords": ["React"]}'
      ;(geminiProvider.generateText as jest.Mock).mockResolvedValue(
        geminiResponse,
      )

      const result = await service.analyzeWithFallback('test prompt')

      expect(result).toBe(geminiResponse)
      expect(groqProvider.generateText).not.toHaveBeenCalled()
    })

    it('should fall back to Groq when Gemini is rate-limited', async () => {
      const groqResponse = '{"atsScore": 68, "matchedKeywords": ["Node"]}'
      ;(geminiProvider.generateText as jest.Mock).mockRejectedValue({
        status: 429,
        message: 'Rate limited',
      })
      ;(groqProvider.generateText as jest.Mock).mockResolvedValue(groqResponse)

      const result = await service.analyzeWithFallback('test prompt')

      expect(result).toBe(groqResponse)
      expect(geminiProvider.generateText).toHaveBeenCalled()
      expect(groqProvider.generateText).toHaveBeenCalled()
    })

    it('should fall back to Groq for network-level errors', async () => {
      const groqResponse = '{"atsScore": 68, "matchedKeywords": ["Node"]}'
      ;(geminiProvider.generateText as jest.Mock).mockRejectedValue(
        new Error('fetch failed'),
      )
      ;(groqProvider.generateText as jest.Mock).mockResolvedValue(groqResponse)

      const result = await service.analyzeWithFallback('test prompt')

      expect(result).toBe(groqResponse)
      expect(geminiProvider.generateText).toHaveBeenCalled()
      expect(groqProvider.generateText).toHaveBeenCalled()
    })

    it('should retry on transient errors before falling back to Groq', async () => {
      const groqResponse = '{"atsScore": 68, "matchedKeywords": ["Node"]}'
      ;(geminiProvider.generateText as jest.Mock)
        .mockRejectedValueOnce(new Error('fetch failed'))
        .mockRejectedValueOnce(new Error('fetch failed'))
      ;(groqProvider.generateText as jest.Mock).mockResolvedValue(groqResponse)

      const result = await service.analyzeWithFallback('test prompt')

      expect(result).toBe(groqResponse)
      expect(geminiProvider.generateText).toHaveBeenCalledTimes(2)
      expect(groqProvider.generateText).toHaveBeenCalled()
    })

    it('should throw ServiceUnavailableException when both providers fail after retries', async () => {
      ;(geminiProvider.generateText as jest.Mock).mockRejectedValue(
        new Error('fetch failed'),
      )
      ;(groqProvider.generateText as jest.Mock).mockRejectedValue(
        new Error('Groq down'),
      )

      await expect(
        service.analyzeWithFallback('test prompt'),
      ).rejects.toThrow(ServiceUnavailableException)

      expect(geminiProvider.generateText).toHaveBeenCalledTimes(2)
      expect(groqProvider.generateText).toHaveBeenCalled()
    })

    it('should throw ServiceUnavailableException when both providers fail', async () => {
      ;(geminiProvider.generateText as jest.Mock).mockRejectedValue({
        status: 429,
      })
      ;(groqProvider.generateText as jest.Mock).mockRejectedValue(
        new Error('Groq down'),
      )

      await expect(
        service.analyzeWithFallback('test prompt'),
      ).rejects.toThrow(ServiceUnavailableException)

      await expect(
        service.analyzeWithFallback('test prompt'),
      ).rejects.toThrow('try again in a moment')
    })

    it('should fall back to Groq when Gemini error message contains quota exceeded', async () => {
      const groqResponse = 'valid response'
      ;(geminiProvider.generateText as jest.Mock).mockRejectedValue(
        new Error('quota exceeded for this project'),
      )
      ;(groqProvider.generateText as jest.Mock).mockResolvedValue(groqResponse)

      const result = await service.analyzeWithFallback('test prompt')

      expect(result).toBe(groqResponse)
      expect(geminiProvider.generateText).toHaveBeenCalled()
      expect(groqProvider.generateText).toHaveBeenCalled()
    })
  })

  describe('parseJsonResponse', () => {
    it('should parse clean JSON string correctly', () => {
      const input = '{"atsScore": 80, "matchedKeywords": ["React"]}'
      const result = service.parseJsonResponse<{
        atsScore: number
        matchedKeywords: string[]
      }>(input)

      expect(result.atsScore).toBe(80)
      expect(result.matchedKeywords).toEqual(['React'])
    })

    it('should strip markdown code fences and parse', () => {
      const input = '```json\n{"atsScore": 72}\n```'
      const result = service.parseJsonResponse<{ atsScore: number }>(input)

      expect(result.atsScore).toBe(72)
    })

    it('should recover JSON from leading/trailing garbage via retry', () => {
      const input =
        'Here is the result: {"atsScore": 65} Hope that helps!'
      const result = service.parseJsonResponse<{ atsScore: number }>(input)

      expect(result.atsScore).toBe(65)
    })

    it('should throw InternalServerErrorException for completely invalid JSON', () => {
      const input = 'Sorry I cannot help with that request.'

      expect(() => service.parseJsonResponse(input)).toThrow(
        InternalServerErrorException,
      )
    })
  })

  describe('validateAtsResult', () => {
    it('should return valid ATS result when all fields are correct', () => {
      const input = {
        atsScore: 75,
        matchedKeywords: ['React'],
        missingKeywords: ['Docker'],
        topRecommendations: ['Add Docker'],
        jobTitle: 'Software Engineer',
      }

      const result = service.validateAtsResult(input)

      expect(result).toEqual(input)
    })

    it('should throw when atsScore is out of range', () => {
      const input = {
        atsScore: 150,
        matchedKeywords: [],
        missingKeywords: [],
        topRecommendations: [],
        jobTitle: null,
      }

      expect(() => service.validateAtsResult(input)).toThrow(
        InternalServerErrorException,
      )
    })

    it('should throw when required fields are missing', () => {
      const input = {
        atsScore: 70,
        matchedKeywords: [],
      }

      expect(() => service.validateAtsResult(input)).toThrow(
        InternalServerErrorException,
      )
    })
  })
})
