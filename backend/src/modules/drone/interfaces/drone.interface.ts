import {
  CreateDroneRequestDto,
  UpdateDroneRequestDto,
  GetDronesRequestDto,
} from '@/modules/drone/dtos/request';
import {
  GetDronesResponseDto,
  GetDroneResponseDto,
  CreateDroneResponseDto,
  UpdateDroneResponseDto,
} from '@/modules/drone/dtos/response';

export interface IDroneService {
  getDronesAsync(requestDto: GetDronesRequestDto): Promise<GetDronesResponseDto>;
  
  getDroneAsync(id: string): Promise<GetDroneResponseDto>;
  
  createDroneAsync(requestDto: CreateDroneRequestDto): Promise<CreateDroneResponseDto>;

  updateDroneAsync(id: string, requestDto: UpdateDroneRequestDto): Promise<UpdateDroneResponseDto>;

  updateMaintenanceTrackingDatesAsync(droneId: string, performedAt: Date): Promise<void>;

  softDeleteDroneAsync(id: string): Promise<void>;
}