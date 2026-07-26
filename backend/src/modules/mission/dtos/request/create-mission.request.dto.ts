import { IsEnum, IsNotEmpty, IsString, IsUUID, IsDateString, MaxLength } from 'class-validator';
import { MissionType } from '@/modules/mission/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class CreateMissionRequestDto {
  @ApiProperty({ 
    type: String, 
    required: true, 
    description: 'Name of the mission', 
    maxLength: 255,
    example: 'Alpha Perimeter Inspection' 
  })
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ 
    type: String, 
    required: true, 
    description: 'Type of the mission', 
    enum: MissionType, 
    example: MissionType.POWER_LINE_PATROL 
  })
  @AutoMap()
  @IsNotEmpty()
  @IsEnum(MissionType, { message: 'Invalid mission type provided.' })
  type: MissionType;

  @ApiProperty({ 
    type: String, 
    required: true, 
    description: 'UUID of the assigned drone', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
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
    example: 'John Doe' 
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
    example: 'Site Alpha - Sector 4' 
  })
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  siteLocation: string;

  @ApiProperty({ 
    type: String, 
    required: true, 
    description: 'Scheduled start time of the mission (ISO 8601)', 
    example: '2026-08-01T08:00:00Z' 
  })
  @AutoMap()
  @IsNotEmpty()
  @IsDateString({}, { message: 'Scheduled start time must be a valid ISO date string.' })
  scheduledStartTime: string;

  @ApiProperty({ 
    type: String, 
    required: true, 
    description: 'Scheduled end time of the mission (ISO 8601)', 
    example: '2026-08-01T12:00:00Z' 
  })
  @AutoMap()
  @IsNotEmpty()
  @IsDateString({}, { message: 'Scheduled end time must be a valid ISO date string.' })
  scheduledEndTime: string;
}