import { ApiProperty } from '@nestjs/swagger';
import { MaintenanceType } from '@/modules/maintenance/enums';
import { AutoMap } from '@automapper/classes';

export class GetMaintenanceLogResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the maintenance log',
  })
  @AutoMap()
  id: string;

  @ApiProperty({
    description: 'ID of the drone',
  })
  @AutoMap()
  droneId: string;

  @ApiProperty({
    description: 'Type of maintenance performed',
    enum: MaintenanceType,
  })
  @AutoMap()
  type: MaintenanceType;

  @ApiProperty({
    description: 'Technician name',
  })
  @AutoMap()
  technicianName: string;

  @ApiProperty({
    description: 'Maintenance notes',
  })
  @AutoMap()
  notes: string | null;

  @ApiProperty({
    description: 'Date maintenance was performed',
  })
  @AutoMap()
  performedAt: Date;

  @ApiProperty({
    description: 'Flight hours recorded at maintenance',
  })
  @AutoMap()
  flightHoursAtMaintenance: number;

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
}
