import { DroneStatus } from '@/modules/drone/enums';
import {
  CreateDroneRequestDto,
  GetDronesRequestDto,
} from '@/modules/drone/dtos/request';
import {
  GetDronesResponseDto,
  GetDroneResponseDto,
  CreateDroneResponseDto,
  UpdateDroneResponseDto,
} from '@/modules/drone/dtos/response';
import { UpdateDroneRequestModel } from '@/modules/drone/models/request';

export interface IDroneService {
  getDronesAsync(
    requestDto: GetDronesRequestDto,
  ): Promise<GetDronesResponseDto>;

  getDroneAsync(id: string): Promise<GetDroneResponseDto>;

  createDroneAsync(
    requestDto: CreateDroneRequestDto,
  ): Promise<CreateDroneResponseDto>;

  updateDroneAsync(
    id: string,
    requestDto: UpdateDroneRequestModel,
  ): Promise<UpdateDroneResponseDto>;

  changeStatusAsync(
    id: string,
    status: DroneStatus,
    flightHoursAtLastMaintenance?: number,
  ): Promise<void>;

  recordFlightHoursAsync(
    droneId: string,
    addedHours: number,
  ): Promise<{ maintenanceTriggered: boolean }>;

  updateMaintenanceTrackingDatesAsync(
    droneId: string,
    performedAt: Date,
  ): Promise<void>;

  softDeleteDroneAsync(id: string): Promise<void>;

  getDroneStatusBreakdownAsync(): Promise<{
    total: number;
    breakdown: Record<string, number>;
  }>;

  getMaintenanceAlertDronesAsync(
    daysThreshold: number,
  ): Promise<GetDroneResponseDto[]>;

  getAverageFlightHoursAsync(): Promise<number>;
}
