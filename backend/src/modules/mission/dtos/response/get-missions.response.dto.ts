import { TotalResponseDto } from "@/shared/dtos/total-response.dto";
import { GetMissionResponseDto } from "./get-mission.response.dto";

export class GetMissionsResponseDto {
  constructor(missions: GetMissionResponseDto[], total: TotalResponseDto) {
    this.missions = missions;
    this.total = total;
  }

  missions: GetMissionResponseDto[];

  total: TotalResponseDto;
}