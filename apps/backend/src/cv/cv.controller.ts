import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { SafeUser } from '../common/types'
import { CvService } from './cv.service'
import { AnalyzeCvDto, RewriteBulletDto } from './dto'
import { PdfFileValidationPipe } from './pipes'
import { AnalysisResponse, RewriteResponse } from './cv.types'

@ApiTags('CV Analysis')
@Controller('cv')
@UseGuards(JwtAuthGuard)
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload CV PDF and analyze against a job description',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cv: {
          type: 'string',
          format: 'binary',
          description: 'PDF resume file (max 5MB)',
        },
        jdText: {
          type: 'string',
          description: 'Full job description text',
          example: 'We are looking for a Senior Software Engineer with 5+ years of experience...',
        },
        jobTitle: {
          type: 'string',
          description: 'Target job title (optional)',
          example: 'Senior Software Engineer',
        },
        companyName: {
          type: 'string',
          description: 'Target company name (optional)',
          example: 'Acme Corp',
        },
      },
      required: ['cv', 'jdText'],
    },
  })
  @ApiResponse({ status: 201, description: 'CV analyzed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or missing fields' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 503, description: 'AI service unavailable' })
  async analyze(
    @CurrentUser() user: SafeUser,
    @UploadedFile(PdfFileValidationPipe) file: Express.Multer.File,
    @Body() dto: AnalyzeCvDto,
  ): Promise<{
    success: boolean
    data: AnalysisResponse
    message: string
  }> {
    const result = await this.cvService.analyzeCv(user.id, file, dto)

    return {
      success: true,
      data: result,
      message: 'CV analyzed successfully.',
    }
  }

  @Post('rewrite-bullet')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Get AI-powered rewrite suggestions for a resume bullet point',
  })
  @ApiResponse({
    status: 200,
    description: 'Rewrite suggestions generated',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Scan does not belong to user',
  })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  async rewriteBullet(
    @CurrentUser() user: SafeUser,
    @Body() dto: RewriteBulletDto,
  ): Promise<{
    success: boolean
    data: RewriteResponse
    message: string
  }> {
    const result = await this.cvService.rewriteBullet(user.id, dto)

    return {
      success: true,
      data: result,
      message: 'Rewrite suggestions generated successfully.',
    }
  }
}
