import { IsEnum, IsOptional, IsNumber, Min, IsNotIn, IsNotEmpty } from 'class-validator';
import { DroneModel, DroneStatus } from '@/modules/drone/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class UpdateDroneRequestDto {
  @ApiProperty({ 
    type: DroneModel, 
    enum: DroneModel, 
    enumName: 'DroneModel', 
    required: false, 
    description: 'Serial number of the drone (exactly 13 characters long)', 
    example: 'SKY-1234-5678' 
  })
  @AutoMap()
  @IsOptional()
  @IsEnum(DroneModel, { message: 'Invalid drone model provided.' })
  model?: DroneModel;

  @ApiProperty({ 
    type: DroneStatus, 
    enum: DroneStatus, 
    enumName: 'DroneStatus', 
    required: true, 
    description: 'Status of the drone', 
    example: DroneStatus.AVAILABLE 
  })
  @AutoMap()
  @IsOptional()
  @IsEnum(DroneStatus, { message: 'Invalid drone status provided.' })
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
    required: true, 
    description: 'Current row version for optimistic locking', 
    example: 1 
  })
  @AutoMap()
  @IsNotEmpty()
  @IsNumber()
  version?: number;
}