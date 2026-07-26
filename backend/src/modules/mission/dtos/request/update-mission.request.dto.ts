import { IsEnum, IsOptional, IsString, IsUUID, IsDateString, MaxLength, IsNumber, Min, ValidateIf } from 'class-validator';
import { MissionType, MissionStatus } from '@/modules/mission/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

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
    type: String, 
    required: false, 
    description: 'Type of the mission', 
    enum: MissionType, 
    enumName: 'MissionType',
    example: MissionType.POWER_LINE_PATROL 
  })
  @AutoMap()
  @IsOptional()
  @IsEnum(MissionType, { message: 'Invalid mission type provided.' })
  type?: MissionType;

  @ApiProperty({ 
    type: String, 
    required: false, 
    description: 'UUID of the assigned drone', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
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
    type: String, 
    required: false, 
    description: 'Scheduled start time of the mission (ISO 8601). Required if scheduledEndTime is provided.', 
    example: '2026-08-01T08:00:00Z' 
  })
  @AutoMap()
  @ValidateIf((o: UpdateMissionRequestDto) => o.scheduledEndTime !== undefined || o.scheduledStartTime !== undefined)
  @IsDateString({}, { message: 'Scheduled start time must be a valid ISO date string and must be provided if scheduledEndTime is updated.' })
  scheduledStartTime?: string;

  @ApiProperty({ 
    type: String, 
    required: false, 
    description: 'Scheduled end time of the mission (ISO 8601). Required if scheduledStartTime is provided.', 
    example: '2026-08-01T12:00:00Z' 
  })
  @AutoMap()
  @ValidateIf((o: UpdateMissionRequestDto) => o.scheduledStartTime !== undefined || o.scheduledEndTime !== undefined)
  @IsDateString({}, { message: 'Scheduled end time must be a valid ISO date string and must be provided if scheduledStartTime is updated.' })
  scheduledEndTime?: string;

  @ApiProperty({ 
    type: String, 
    required: false, 
    description: 'Status of the mission', 
    enum: MissionStatus, 
    enumName: 'MissionStatus',
    example: MissionStatus.IN_PROGRESS 
  })
  @AutoMap()
  @IsOptional()
  @IsEnum(MissionStatus, { message: 'Invalid mission status provided.' })
  status?: MissionStatus;

  @ApiProperty({ 
    type: Number, 
    required: false, 
    description: 'Flight hours logged upon completion of the mission', 
    example: 3.5 
  })
  @AutoMap()
  @IsOptional()
  @IsNumber()
  @Min(0)
  flightHoursAtCompletion?: number;

  @ApiProperty({ 
    type: String, 
    required: false, 
    description: 'Reason for aborting the mission', 
    example: 'Adverse weather conditions' 
  })
  @AutoMap()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  abortReason?: string;
}