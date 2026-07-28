import { IsEnum, IsOptional, IsNumber, Min, IsNotIn, IsNotEmpty, Max } from 'class-validator';
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
    enum: DroneStatus, 
    enumName: 'DroneStatus',  
    description: 'Status of the drone', 
    example: DroneStatus.AVAILABLE 
  })
  @AutoMap()
  @IsOptional()
  @IsEnum(DroneStatus, { message: `Invalid drone status provided. It must be one of the allowed values: ${Object.values(DroneStatus).filter(v => v !== DroneStatus.IN_MISSION).join(', ')}` })
  @IsNotIn([DroneStatus.IN_MISSION], { 
    message: 'Manual transition to IN_MISSION is strictly forbidden. Status is managed by missions.' 
  })
  status?: DroneStatus;

  @ApiProperty({ 
    type: Number, 
    required: false, 
    description: 'Total flight hours of the drone', 
    example: 45.5 
  })
  @AutoMap()
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalFlightHours?: number;

  @ApiProperty({ 
    type: Number, 
    required: false, 
    description: 'Flight hours of the drone at last maintenance', 
    example: 45.5 
  })
  @AutoMap()
  @IsOptional()
  @IsNumber()
  @Min(0)
  flightHoursAtLastMaintenance?: number;

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