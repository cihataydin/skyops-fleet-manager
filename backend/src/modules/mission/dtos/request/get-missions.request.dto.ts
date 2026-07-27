import { AutoMap } from '@automapper/classes';
import { BaseFilterRequestDto } from '@/shared/dtos';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MissionType, MissionStatus } from '@/modules/mission/enums';

export class GetMissionsRequestDto extends BaseFilterRequestDto {
  @ApiProperty({ 
    type: String, 
    required: false, 
    description: 'Filter missions by name',
    maxLength: 255,
  })
  @AutoMap()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    type: MissionType, 
    enum: MissionType, 
    enumName: 'MissionType',
    required: false 
  })
  @AutoMap()
  @IsEnum(MissionType, { message: `Invalid mission type provided. It must be one of the allowed values: ${Object.values(MissionType).join(', ')}` })
  @IsOptional()
  type?: MissionType;

  @ApiProperty({ 
    type: MissionStatus, 
    enum: MissionStatus, 
    enumName: 'MissionStatus', 
    required: false 
  })
  @AutoMap()
  @IsEnum(MissionStatus, { message: `Invalid mission status provided. It must be one of the allowed values: ${Object.values(MissionStatus).join(', ')}` })
  @IsOptional()
  status?: MissionStatus;

  @ApiProperty({ 
    type: String, 
    required: false, 
    description: 'Filter missions by assigned drone ID', 
  })
  @AutoMap()
  @IsUUID('4', { message: 'Drone ID must be a valid UUID.' })
  @IsOptional()
  droneId?: string;

  @ApiProperty({ 
    type: String, 
    required: false, 
    description: 'Filter missions by pilot name',
    maxLength: 255,
  })
  @AutoMap()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  pilotName?: string;

  @ApiProperty({ 
    type: Date, 
    required: false, 
    description: 'Filter missions scheduled on or after this date (ISO 8601)', 
  })
  @AutoMap()
  @IsDate({ message: 'Start date must be a valid ISO date string. For instance: 2026-08-01T12:00:00Z'})
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ 
    type: Date, 
    required: false, 
    description: 'Filter missions scheduled on or before this date (ISO 8601)', 
  })
  @AutoMap()
  @IsDate({ message: 'End date must be a valid ISO date string. For instance: 2026-08-01T12:00:00Z'})
  @IsOptional()
  endDate?: Date;
}