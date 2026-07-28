import { IsEnum, IsOptional, IsNumber, Min, IsNotEmpty, IsIn } from 'class-validator';
import { DroneModel, DroneStatus } from '@/modules/drone/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class UpdateDroneRequestDto {
  @ApiProperty({ 
    type: DroneModel,
    required: false, 
    enum: DroneModel, 
    enumName: 'DroneModel',
    description: 'Model of the drone', 
    example: DroneModel.MATRICE_300 
  })
  @AutoMap()
  @IsOptional()
  @IsEnum(DroneModel, { message: `Invalid drone model provided. It must be one of the allowed values: ${Object.values(DroneModel).join(', ')}` })
  model?: DroneModel;

  @ApiProperty({ 
    type: DroneStatus,
    required: false, 
    enum: [DroneStatus.RETIRED],
    description: 'Status of the drone (Manual update is restricted to RETIRED only)',
    enumName: 'DroneStatus',  
    example: DroneStatus.RETIRED 
  })
  @AutoMap()
  @IsOptional()
  @IsIn([DroneStatus.RETIRED], { 
    message: 'Manual status updates are restricted. Drones can only be manually marked as RETIRED. Other statuses are managed automatically by system events.' 
  })
  status?: DroneStatus;

  @ApiProperty({ 
    type: Number, 
    required: true, 
    description: 'Current row version for optimistic locking', 
    example: 1 
  })
  @AutoMap()
  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Version must be at least 1.' })
  version?: number;
}