import {
  CreateMissionRequestDto,
  UpdateMissionRequestDto,
  GetMissionsRequestDto,
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

  softDeleteMissionAsync(id: string): Promise<void>;
}