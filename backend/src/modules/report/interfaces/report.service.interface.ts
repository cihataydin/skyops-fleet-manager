import { FleetHealthReportResponseDto } from '../dtos/response';

export interface IReportService {
  getFleetHealthReportAsync(): Promise<FleetHealthReportResponseDto>;
}
