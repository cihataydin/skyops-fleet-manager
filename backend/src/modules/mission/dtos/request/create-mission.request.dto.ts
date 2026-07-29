import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  IsDate,
} from 'class-validator';
import { MissionType } from '@/modules/mission/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsAfterDate, IsFutureDate } from '@/modules/mission/decorators';
import { Type } from 'class-transformer';

export class CreateMissionRequestDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'Name of the mission',
    maxLength: 255,
    example: 'Alpha Perimeter Inspection',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    type: MissionType,
    required: true,
    enum: MissionType,
    enumName: 'MissionType',
    description: 'Type of the mission',
    example: MissionType.POWER_LINE_PATROL,
  })
  @AutoMap()
  @IsNotEmpty()
  @IsEnum(MissionType, {
    message: `Invalid mission type provided. It must be one of the allowed values: ${Object.values(MissionType).join(', ')}`,
  })
  type: MissionType;

  @ApiProperty({
    type: String,
    required: true,
    description: 'UUID of the assigned drone',
    example: '123e4567-e89b-42d3-a456-426614174000',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsUUID('4', { message: 'Drone ID must be a valid UUID.' })
  droneId: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'Name of the assigned pilot',
    maxLength: 255,
    example: 'John Doe',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  pilotName: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'Location or site of the mission',
    maxLength: 255,
    example: 'Site Alpha - Sector 4',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  siteLocation: string;

  @ApiProperty({
    type: Date,
    required: true,
    description: 'Scheduled start time of the mission (ISO 8601)',
    example: '2026-08-01T08:00:00Z',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsDate()
  @IsFutureDate({ message: 'Scheduled start time must be in the future.' })
  @Type(() => Date)
  scheduledStartTime: Date;

  @ApiProperty({
    type: Date,
    required: true,
    description: 'Scheduled end time of the mission (ISO 8601)',
    example: '2026-08-01T12:00:00Z',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsDate()
  @IsAfterDate('scheduledStartTime', {
    message: 'Scheduled end time must be after the scheduled start time.',
  })
  @Type(() => Date)
  scheduledEndTime: Date;
}
