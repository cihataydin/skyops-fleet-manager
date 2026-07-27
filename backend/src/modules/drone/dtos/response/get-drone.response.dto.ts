import { ApiProperty } from '@nestjs/swagger';
import { DroneModel, DroneStatus } from '@/modules/drone/enums';
import { AutoMap } from '@automapper/classes';

export class GetDroneResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the drone',
  })
  @AutoMap()
  id: string;

  @ApiProperty({
    description: 'Drone unique serial number (Format: SKY-XXXX-XXXX)',
  })
  @AutoMap()
  serialNumber: string;

  @ApiProperty({
    description: 'Drone model',
    enum: DroneModel,
  })
  @AutoMap()
  model: DroneModel;

  @ApiProperty({
    description: 'Current status of the drone',
    enum: DroneStatus,
  })
  @AutoMap()
  status: DroneStatus;

  @ApiProperty({
    description: 'Total flight hours accumulated',
  })
  @AutoMap()
  totalFlightHours: number;

  @ApiProperty({
    description: 'Date of the last maintenance',
  })
  @AutoMap()
  lastMaintenanceDate: Date | null;

  @ApiProperty({
    description: 'Due date for the next maintenance',
  })
  @AutoMap()
  nextMaintenanceDueDate: Date;

  @ApiProperty({
    description: 'Record creation timestamp',
  })
  @AutoMap()
  createdAt: Date;

  @ApiProperty({
    description: 'Record update timestamp',
  })
  @AutoMap()
  updatedAt: Date;

  @ApiProperty({
    description: 'Row version for optimistic locking',
  })
  @AutoMap()
  version: number;
}