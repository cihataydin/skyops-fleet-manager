import { Controller, Get, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The fleet health report has been successfully retrieved.',
    type: FleetHealthReportResponseDto,
  })
  public async getFleetHealthReportAsync() {
    const report = await this.reportService.getFleetHealthReportAsync();
    return formatResponse(report);
  }
}
