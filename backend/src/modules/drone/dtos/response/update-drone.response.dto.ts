import { ApiProperty } from '@nestjs/swagger';
import { DroneModel, DroneStatus } from '@/modules/drone/enums';
import { AutoMap } from '@automapper/classes';

export class UpdateDroneResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the drone',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @AutoMap()
  id: string;

  @ApiProperty({
    description: 'Drone unique serial number (Format: SKY-XXXX-XXXX)',
    example: 'SKY-AB12-CD34',
  })
  serialNumber: string;

  @ApiProperty({
    description: 'Drone model',
    enum: DroneModel,
    example: DroneModel.MATRICE_300,
  })
  @AutoMap()
  model: DroneModel;

  @ApiProperty({
    description: 'Current status of the drone',
    enum: DroneStatus,
    example: DroneStatus.AVAILABLE,
  })
  @AutoMap()
  status: DroneStatus;

  @ApiProperty({
    description: 'Total flight hours accumulated',
    example: 12.5,
  })
  @AutoMap()
  totalFlightHours: number;

  @ApiProperty({
    description: 'Date of the last maintenance',
    type: Date,
    nullable: true,
    example: '2026-06-01T10:00:00.000Z',
  })
  @AutoMap()
  lastMaintenanceDate: Date | null;

  @ApiProperty({
    description: 'Due date for the next maintenance',
    type: Date,
    example: '2026-08-30T10:00:00.000Z',
  })
  @AutoMap()
  nextMaintenanceDueDate: Date;

  @ApiProperty({
    description: 'Record creation timestamp',
    type: Date,
    example: '2026-01-01T00:00:00.000Z',
  })
  @AutoMap()
  createdAt: Date;

  @ApiProperty({
    description: 'Record update timestamp',
    type: Date,
    example: '2026-06-01T10:00:00.000Z',
  })
  @AutoMap()
  updatedAt: Date;
}