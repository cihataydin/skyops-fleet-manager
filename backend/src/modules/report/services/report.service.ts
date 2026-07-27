import { Inject, Injectable } from '@nestjs/common';
import { IReportService } from '../interfaces/report.service.interface';
import { FleetHealthReportResponseDto } from '../dtos/response/fleet-health-report.response.dto';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { IDroneService } from '@/modules/drone/interfaces';
import { MISSION_SERVICE_TOKEN } from '@/modules/mission/di';
import { IMissionService } from '@/modules/mission/interfaces';
import { HOURS_PER_DAY } from '@/shared/constants';

@Injectable()
export class ReportService implements IReportService {
  public constructor(
    @Inject(DRONE_SERVICE_TOKEN) private readonly droneService: IDroneService,
    @Inject(MISSION_SERVICE_TOKEN) private readonly missionService: IMissionService,
  ) {}

  public async getFleetHealthReportAsync(): Promise<FleetHealthReportResponseDto> {
    const statusBreakdownData = await this.droneService.getDroneStatusBreakdownAsync();
    const overdueDrones = await this.droneService.getOverdueMaintenanceDronesAsync();
    const averageFlightHours = await this.droneService.getAverageFlightHoursAsync();
    const missionsNext24Hours = await this.missionService.getUpcomingMissionsCountAsync(HOURS_PER_DAY);

    return {
      totalDroneCount: statusBreakdownData.total,
      statusBreakdown: statusBreakdownData.breakdown,
      overdueMaintenanceDrones: overdueDrones,
      averageFlightHours: Number(averageFlightHours.toFixed(2)),
      missionsNext24Hours,
    } as FleetHealthReportResponseDto;
  }
}
