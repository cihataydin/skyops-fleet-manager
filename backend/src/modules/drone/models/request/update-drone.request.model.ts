import { IsEnum, IsOptional, IsNumber, Min, IsNotIn, IsNotEmpty, Max, IsIn } from 'class-validator';
import { DroneModel, DroneStatus } from '@/modules/drone/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class UpdateDroneRequestModel {
  @AutoMap()
  model?: DroneModel;

  @AutoMap()
  status?: DroneStatus;

  @AutoMap()
  totalFlightHours?: number;

  @AutoMap()
  flightHoursAtLastMaintenance?: number;

  @AutoMap()
  version?: number;
}