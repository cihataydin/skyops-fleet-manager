import { AutoMap } from '@automapper/classes';
import { BaseFilterRequestDto } from '@/shared/dtos';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DroneModel, DroneStatus } from '@/modules/drone/enums';

export class GetDronesRequestDto extends BaseFilterRequestDto {
  @ApiProperty({ 
    type: DroneModel, 
    enum: DroneModel, 
    enumName: 'DroneModel',
    required: false 
  })
  @AutoMap()
  @IsEnum(DroneModel, { message: 'Invalid drone model provided.' })
  @IsOptional()
  model?: DroneModel;

  @ApiProperty({ 
    type: DroneStatus, 
    enum: DroneStatus, 
    enumName: 'DroneStatus', 
    required: false 
  })
  @AutoMap()
  @IsEnum(DroneStatus, { message: 'Invalid drone status provided.' })
  @IsOptional()
  status?: DroneStatus;
}
