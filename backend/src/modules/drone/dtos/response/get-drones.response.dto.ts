import { TotalResponseDto } from '@/shared/dtos/total-response.dto';
import { GetDroneResponseDto } from './get-drone.response.dto';

export class GetDronesResponseDto {
  constructor(drones: GetDroneResponseDto[], total: TotalResponseDto) {
    this.drones = drones;
    this.total = total;
  }

  drones: GetDroneResponseDto[];

  total: TotalResponseDto;
}
