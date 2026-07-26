import { AutoMap } from '@automapper/classes';
import { BaseFilterRequestDto } from '@/shared/dtos';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MissionType, MissionStatus } from '@/modules/mission/enums';

export class GetMissionsRequestDto extends BaseFilterRequestDto {
  @ApiProperty({ 
    type: String, 
    required: false, 
    description: 'Filter missions by name',
    maxLength: 255,
    example: 'Alpha Perimeter' 
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
  @IsEnum(MissionType, { message: 'Invalid mission type provided.' })
  @IsOptional()
  type?: MissionType;

  @ApiProperty({ 
    type: MissionStatus, 
    enum: MissionStatus, 
    enumName: 'MissionStatus', 
    required: false 
  })
  @AutoMap()
  @IsEnum(MissionStatus, { message: 'Invalid mission status provided.' })
  @IsOptional()
  status?: MissionStatus;

  @ApiProperty({ 
    type: String, 
    required: false, 
    description: 'Filter missions by assigned drone ID', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
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
    example: 'John Doe' 
  })
  @AutoMap()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  pilotName?: string;
}