import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { SafeUser } from '../common/types'
import { ScanService } from './scan.service'
import { CreateScanDto, UpdateScanDto } from './dto'

@ApiTags('Scans')
@Controller('scans')
@UseGuards(JwtAuthGuard)
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new scan' })
  @ApiResponse({ status: 201, description: 'Scan created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  create(
    @CurrentUser() user: SafeUser,
    @Body() dto: CreateScanDto,
  ): Promise<{
    id: string
    jobTitle: string | null
    companyName: string | null
    atsScore: number
    createdAt: Date
    updatedAt: Date
  }> {
    return this.scanService.create(user.id, dto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List user scans (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Scans retrieved' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  findAll(
    @CurrentUser() user: SafeUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
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
    const pageNumber = page ? parseInt(page, 10) : 1
    const limitNumber = limit ? parseInt(limit, 10) : 10
    return this.scanService.findAllByUser(user.id, pageNumber, limitNumber)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get scan details' })
  @ApiResponse({ status: 200, description: 'Scan details retrieved' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  findOne(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
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
    return this.scanService.findOne(user.id, id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a scan' })
  @ApiResponse({ status: 200, description: 'Scan updated' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  update(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
    @Body() dto: UpdateScanDto,
  ): Promise<{
    id: string
    jobTitle: string | null
    companyName: string | null
    atsScore: number
    createdAt: Date
    updatedAt: Date
  }> {
    return this.scanService.update(user.id, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a scan' })
  @ApiResponse({ status: 200, description: 'Scan deleted' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  remove(
    @CurrentUser() user: SafeUser,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.scanService.remove(user.id, id)
  }
}
