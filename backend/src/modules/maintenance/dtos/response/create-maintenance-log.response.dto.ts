import { ApiProperty } from '@nestjs/swagger';
import { MaintenanceType } from '@/modules/maintenance/enums';
import { AutoMap } from '@automapper/classes';

export class CreateMaintenanceLogResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the maintenance log',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @AutoMap()
  id: string;

  @ApiProperty({
    description: 'ID of the drone',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @AutoMap()
  droneId: string;

  @ApiProperty({
    description: 'Type of maintenance performed',
    enum: MaintenanceType,
    example: MaintenanceType.ROUTINE_CHECK,
  })
  @AutoMap()
  type: MaintenanceType;

  @ApiProperty({
    description: 'Technician name',
    example: 'John Doe',
  })
  @AutoMap()
  technicianName: string;

  @ApiProperty({
    description: 'Maintenance notes',
    nullable: true,
    example: 'Replaced left rotor',
  })
  @AutoMap()
  notes: string | null;

  @ApiProperty({
    description: 'Date maintenance was performed',
    type: Date,
    example: '2026-07-26T10:00:00.000Z',
  })
  @AutoMap()
  performedAt: Date;

  @ApiProperty({
    description: 'Flight hours recorded at maintenance',
    example: 45.5,
  })
  @AutoMap()
  flightHoursAtMaintenance: number;

  @ApiProperty({
    description: 'Record creation timestamp',
    type: Date,
    example: '2026-01-01T00:00:00.000Z',
  })
  @AutoMap()
  createdAt: Date;
}
