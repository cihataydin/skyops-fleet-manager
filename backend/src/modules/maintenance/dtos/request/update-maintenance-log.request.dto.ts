import { IsEnum, IsOptional, IsString, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';
import { MaintenanceType } from '@/modules/maintenance/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class UpdateMaintenanceLogRequestDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'ID of the drone being maintained',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @AutoMap()
  @IsOptional()
  @IsUUID()
  droneId?: string;

  @ApiProperty({
    type: MaintenanceType,
    enum: MaintenanceType,
    enumName: 'MaintenanceType',
    required: false,
    description: 'Type of maintenance performed',
    example: MaintenanceType.ROUTINE_CHECK,
  })
  @AutoMap()
  @IsOptional()
  @IsEnum(MaintenanceType, { message: 'Invalid maintenance type provided.' })
  type?: MaintenanceType;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Name of the technician performing maintenance',
    example: 'John Doe',
  })
  @AutoMap()
  @IsOptional()
  @IsString()
  technicianName?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Additional notes or remarks',
    example: 'Replaced left rotor and updated firmware.',
  })
  @AutoMap()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Timestamp when maintenance was performed',
    example: '2026-07-26T10:00:00.000Z',
  })
  @AutoMap()
  @IsOptional()
  @IsDateString()
  performedAt?: Date;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Drone flight hours at the time of maintenance',
    example: 45.5,
  })
  @AutoMap()
  @IsOptional()
  @IsNumber()
  @Min(0)
  flightHoursAtMaintenance?: number;
}
