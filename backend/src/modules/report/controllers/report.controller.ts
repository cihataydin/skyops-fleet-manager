import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IReportService } from '../interfaces/report.service.interface';
import { REPORT_SERVICE_TOKEN } from '../di';
import { FleetHealthReportResponseDto } from '../dtos/response/fleet-health-report.response.dto';
import { formatResponse } from '@/shared/utils';

@ApiTags('reports')
@Controller('reports')
export class ReportController {
  public constructor(
    @Inject(REPORT_SERVICE_TOKEN)
    private readonly reportService: IReportService,
  ) {}

  @Get('fleet-health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieves the fleet health report summary' })
  @ApiQuery({
    name: 'daysThreshold',
    required: false,
    type: Number,
    description:
      'Number of days to check for upcoming maintenance alerts (default: 7)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The fleet health report has been successfully retrieved.',
    type: FleetHealthReportResponseDto,
  })
  public async getFleetHealthReportAsync(
    @Query('daysThreshold', new DefaultValuePipe(7), ParseIntPipe)
    daysThreshold: number,
  ) {
    const report =
      await this.reportService.getFleetHealthReportAsync(daysThreshold);
    return formatResponse(report);
  }
}
