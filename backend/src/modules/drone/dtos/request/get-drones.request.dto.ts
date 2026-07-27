import { AutoMap } from '@automapper/classes';
import { BaseFilterRequestDto } from '@/shared/dtos';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DroneModel, DroneStatus } from '@/modules/drone/enums';

export class GetDronesRequestDto extends BaseFilterRequestDto {
  @ApiProperty({ 
    type: DroneModel,
    required: false, 
    enum: DroneModel, 
    enumName: 'DroneModel',
    description: 'Filter by drone model',
  })
  @AutoMap()
  @IsEnum(DroneModel, { message: `Invalid drone model provided. It must be one of the allowed values: ${Object.values(DroneModel).join(', ')}` })
  @IsOptional()
  model?: DroneModel;

  @ApiProperty({ 
    type: DroneStatus,
    required: false,  
    enum: DroneStatus, 
    enumName: 'DroneStatus',
    description: 'Filter by drone status', 
  })
  @AutoMap()
  @IsEnum(DroneStatus, { message: `Invalid drone status provided. It must be one of the allowed values: ${Object.values(DroneStatus).join(', ')}` })
  @IsOptional()
  status?: DroneStatus;
}
