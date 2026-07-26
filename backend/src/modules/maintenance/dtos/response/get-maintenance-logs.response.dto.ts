import { TotalResponseDto } from '@/shared/dtos/total-response.dto';
import { GetMaintenanceLogResponseDto } from './get-maintenance-log.response.dto';

export class GetMaintenanceLogsResponseDto {
  constructor(logs: GetMaintenanceLogResponseDto[], total: TotalResponseDto) {
    this.logs = logs;
    this.total = total;
  }

  logs: GetMaintenanceLogResponseDto[];

  total: TotalResponseDto;
}
