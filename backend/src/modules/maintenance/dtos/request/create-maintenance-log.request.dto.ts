import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, MaxLength, IsDate } from 'class-validator';
import { MaintenanceType } from '@/modules/maintenance/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class CreateMaintenanceLogRequestDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'ID of the drone being maintained',
    example: '123e4567-e89b-42d3-a456-426614174000',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsUUID()
  droneId: string;

  @ApiProperty({
    type: MaintenanceType,
    required: true,
    enum: MaintenanceType,
    enumName: 'MaintenanceType',
    description: 'Type of maintenance performed',
    example: MaintenanceType.ROUTINE_CHECK,
  })
  @AutoMap()
  @IsNotEmpty()
  @IsEnum(MaintenanceType, { message: `Invalid maintenance type provided. It must be one of the allowed values: ${Object.values(MaintenanceType).join(', ')}` })
  type: MaintenanceType;

  @ApiProperty({
    type: String,
    required: true,
    description: 'Name of the technician performing maintenance',
    example: 'John Doe',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255, { message: 'Technician name must not exceed 255 characters.' })
  technicianName: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Additional notes or remarks',
    example: 'Replaced left rotor and updated firmware.',
  })
  @AutoMap()
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes must not exceed 500 characters.' })
  notes?: string;

  @ApiProperty({
    type: Date,
    required: true,
    description: 'Timestamp when maintenance was performed',
    example: '2026-07-26T10:00:00.000Z',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsDate()
  performedAt: Date;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Drone flight hours at the time of maintenance',
    example: 45.5,
  })
  @AutoMap()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  flightHoursAtMaintenance: number;
}
