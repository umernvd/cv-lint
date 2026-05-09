import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { SafeUser } from '../common/types'
import { HistoryService } from './history.service'
import { GetScansQueryDto } from './dto'
import { PaginatedScansResponse, ScanDetail } from './history.types'

@ApiTags('Scan History')
@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get paginated scan history for the authenticated user',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Results per page (default: 20, max: 100)',
    example: 20,
  })
  @ApiResponse({ status: 200, description: 'Scan history retrieved' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getHistory(
    @CurrentUser() user: SafeUser,
    @Query() query: GetScansQueryDto,
  ): Promise<{
    success: boolean
    data: PaginatedScansResponse
    message: string
  }> {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const result = await this.historyService.getUserScans(user.id, page, limit)

    return {
      success: true,
      data: result,
      message: 'Scan history retrieved successfully.',
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get full details of a specific scan',
  })
  @ApiParam({
    name: 'id',
    description: 'The scan ID',
    example: 'clx1234567890',
  })
  @ApiResponse({ status: 200, description: 'Scan details retrieved' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Scan belongs to another user' })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  async getScan(
    @CurrentUser() user: SafeUser,
    @Param('id') scanId: string,
  ): Promise<{
    success: boolean
    data: ScanDetail
    message: string
  }> {
    const result = await this.historyService.getScanById(user.id, scanId)

    return {
      success: true,
      data: result,
      message: 'Scan retrieved successfully.',
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a specific scan',
  })
  @ApiParam({
    name: 'id',
    description: 'The scan ID to delete',
    example: 'clx1234567890',
  })
  @ApiResponse({ status: 200, description: 'Scan deleted successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Scan belongs to another user' })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  async deleteScan(
    @CurrentUser() user: SafeUser,
    @Param('id') scanId: string,
  ): Promise<{
    success: boolean
    data: { success: true }
    message: string
  }> {
    const result = await this.historyService.deleteScan(user.id, scanId)

    return {
      success: true,
      data: result,
      message: 'Scan deleted successfully.',
    }
  }
}
