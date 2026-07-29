import {
  CreateMissionRequestDto,
  UpdateMissionRequestDto,
  GetMissionsRequestDto,
  CompleteMissionRequestDto,
  AbortMissionRequestDto,
} from '@/modules/mission/dtos/request';
import {
  GetMissionsResponseDto,
  GetMissionResponseDto,
  CreateMissionResponseDto,
  UpdateMissionResponseDto,
} from '@/modules/mission/dtos/response';

export interface IMissionService {
  getMissionsAsync(requestDto: GetMissionsRequestDto): Promise<GetMissionsResponseDto>;
  
  getMissionAsync(id: string): Promise<GetMissionResponseDto>;
  
  createMissionAsync(requestDto: CreateMissionRequestDto): Promise<CreateMissionResponseDto>;

  updateMissionAsync(id: string, requestDto: UpdateMissionRequestDto): Promise<UpdateMissionResponseDto>;

  preFlightCheckMissionAsync(id: string): Promise<UpdateMissionResponseDto>;

  startMissionAsync(id: string): Promise<UpdateMissionResponseDto>;

  completeMissionAsync(id: string, requestDto: CompleteMissionRequestDto): Promise<UpdateMissionResponseDto>;

  abortMissionAsync(id: string, requestDto: AbortMissionRequestDto): Promise<UpdateMissionResponseDto>;

  softDeleteMissionAsync(id: string): Promise<void>;

  hasUpcomingMissionAsync(droneId: string): Promise<boolean>;

  getUpcomingMissionsCountAsync(hours: number): Promise<number>;
}