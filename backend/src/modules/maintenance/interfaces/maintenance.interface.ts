import {
  CreateMaintenanceLogRequestDto,
  UpdateMaintenanceLogRequestDto,
  GetMaintenanceLogsRequestDto,
} from '@/modules/maintenance/dtos/request';
import {
  GetMaintenanceLogsResponseDto,
  GetMaintenanceLogResponseDto,
  CreateMaintenanceLogResponseDto,
  UpdateMaintenanceLogResponseDto,
} from '@/modules/maintenance/dtos/response';

export interface IMaintenanceService {
  getMaintenanceLogsAsync(requestDto: GetMaintenanceLogsRequestDto): Promise<GetMaintenanceLogsResponseDto>;

  getMaintenanceLogAsync(id: string): Promise<GetMaintenanceLogResponseDto>;

  createMaintenanceLogAsync(requestDto: CreateMaintenanceLogRequestDto): Promise<CreateMaintenanceLogResponseDto>;

  updateMaintenanceLogAsync(id: string, requestDto: UpdateMaintenanceLogRequestDto): Promise<UpdateMaintenanceLogResponseDto>;

  softDeleteMaintenanceLogAsync(id: string): Promise<void>;
}
