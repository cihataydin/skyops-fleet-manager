import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, IsDateString, Min } from 'class-validator';
import { MaintenanceType } from '@/modules/maintenance/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class CreateMaintenanceLogRequestDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'ID of the drone being maintained',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsUUID()
  droneId: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'Type of maintenance performed',
    enum: MaintenanceType,
    example: MaintenanceType.ROUTINE_CHECK,
  })
  @AutoMap()
  @IsNotEmpty()
  @IsEnum(MaintenanceType, { message: 'Invalid maintenance type provided.' })
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
  notes?: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'Timestamp when maintenance was performed',
    example: '2026-07-26T10:00:00.000Z',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsDateString()
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
