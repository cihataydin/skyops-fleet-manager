import {
  CreateMaintenanceLogRequestDto,
  GetMaintenanceLogsRequestDto,
} from '@/modules/maintenance/dtos/request';
import {
  GetMaintenanceLogsResponseDto,
  GetMaintenanceLogResponseDto,
  CreateMaintenanceLogResponseDto,
} from '@/modules/maintenance/dtos/response';

export interface IMaintenanceService {
  getMaintenanceLogsAsync(
    requestDto: GetMaintenanceLogsRequestDto,
  ): Promise<GetMaintenanceLogsResponseDto>;

  getMaintenanceLogAsync(id: string): Promise<GetMaintenanceLogResponseDto>;

  createMaintenanceLogAsync(
    requestDto: CreateMaintenanceLogRequestDto,
  ): Promise<CreateMaintenanceLogResponseDto>;
}
