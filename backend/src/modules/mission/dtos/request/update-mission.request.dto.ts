import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, IsNumber, Min, ValidateIf, IsNotEmpty, IsDate } from 'class-validator';
import { MissionType } from '@/modules/mission/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsAfterDate, IsFutureDate } from '@/modules/mission/decorators';

export class UpdateMissionRequestDto {
  @ApiProperty({ 
    type: String, 
    required: false, 
    description: 'Name of the mission', 
    maxLength: 255,
    example: 'Alpha Perimeter Inspection' 
  })
  @AutoMap()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ 
    type: MissionType, 
    required: false, 
    description: 'Type of the mission', 
    enum: MissionType, 
    enumName: 'MissionType',
    example: MissionType.POWER_LINE_PATROL 
  })
  @AutoMap()
  @IsOptional()
  @IsEnum(MissionType, { message: `Invalid mission type provided. It must be one of the allowed values: ${Object.values(MissionType).join(', ')}`  })
  type?: MissionType;

  @ApiProperty({ 
    type: String, 
    required: false, 
    description: 'UUID of the assigned drone', 
    example: '123e4567-e89b-42d3-a456-426614174000' 
  })
  @AutoMap()
  @IsOptional()
  @IsUUID('4', { message: 'Drone ID must be a valid UUID.' })
  droneId?: string;

  @ApiProperty({ 
    type: String, 
    required: false, 
    description: 'Name of the assigned pilot', 
    maxLength: 255,
    example: 'John Doe' 
  })
  @AutoMap()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  pilotName?: string;

  @ApiProperty({ 
    type: String, 
    required: false, 
    description: 'Location or site of the mission', 
    maxLength: 255,
    example: 'Site Alpha - Sector 4' 
  })
  @AutoMap()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  siteLocation?: string;

  @ApiProperty({ 
    type: Date, 
    required: false, 
    description: 'Scheduled start time of the mission (ISO 8601). Required if scheduledEndTime is provided.', 
    example: '2026-08-01T08:00:00Z' 
  })
  @AutoMap()
  @ValidateIf((o: UpdateMissionRequestDto) => o.scheduledEndTime !== undefined || o.scheduledStartTime !== undefined)
  @IsDate({ message: 'Scheduled start time must be a valid ISO date and must be provided if scheduledEndTime is updated.' })
  @IsFutureDate({ message: 'Scheduled start time must be in the future.' })
  scheduledStartTime?: Date;

  @ApiProperty({ 
    type: Date, 
    required: false, 
    description: 'Scheduled end time of the mission (ISO 8601). Required if scheduledStartTime is provided.', 
    example: '2026-08-01T12:00:00Z' 
  })
  @AutoMap()
  @ValidateIf((o: UpdateMissionRequestDto) => o.scheduledStartTime !== undefined || o.scheduledEndTime !== undefined)
  @IsDate({ message: 'Scheduled start time must be a valid ISO date and must be provided if scheduledStartTime is updated.' })
  @IsAfterDate('scheduledStartTime', { message: 'Scheduled end time must be after the scheduled start time.' })
  scheduledEndTime?: Date;

  @ApiProperty({ 
    type: Number, 
    required: true, 
    description: 'Current row version for optimistic locking', 
    example: 1 
  })
  @AutoMap()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  version?: number;
}