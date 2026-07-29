import { FleetHealthReportResponseDto } from '../dtos/response';

export interface IReportService {
  getFleetHealthReportAsync(
    daysThreshold: number,
  ): Promise<FleetHealthReportResponseDto>;
}
