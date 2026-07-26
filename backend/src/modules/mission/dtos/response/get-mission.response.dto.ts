import { ApiProperty } from '@nestjs/swagger';
import { MissionType, MissionStatus } from '@/modules/mission/enums';
import { AutoMap } from '@automapper/classes';

export class GetMissionResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the mission',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @AutoMap()
  id: string;

  @ApiProperty({
    description: 'Name of the mission',
    example: 'Alpha Perimeter Inspection',
  })
  @AutoMap()
  name: string;

  @ApiProperty({
    description: 'Type of the mission',
    enum: MissionType,
    enumName: 'MissionType',
    example: MissionType.POWER_LINE_PATROL,
  })
  @AutoMap()
  type: MissionType;

  @ApiProperty({
    description: 'UUID of the assigned drone',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @AutoMap()
  droneId: string;

  @ApiProperty({
    description: 'Name of the assigned pilot',
    example: 'John Doe',
  })
  @AutoMap()
  pilotName: string;

  @ApiProperty({
    description: 'Location or site of the mission',
    example: 'Site Alpha - Sector 4',
  })
  @AutoMap()
  siteLocation: string;

  @ApiProperty({
    description: 'Scheduled start time of the mission',
    type: Date,
    example: '2026-08-01T08:00:00.000Z',
  })
  @AutoMap()
  scheduledStartTime: Date;

  @ApiProperty({
    description: 'Scheduled end time of the mission',
    type: Date,
    example: '2026-08-01T12:00:00.000Z',
  })
  @AutoMap()
  scheduledEndTime: Date;

  @ApiProperty({
    description: 'Actual start time of the mission',
    type: Date,
    nullable: true,
    example: '2026-08-01T08:05:00.000Z',
  })
  @AutoMap()
  actualStartTime: Date | null;

  @ApiProperty({
    description: 'Actual end time of the mission',
    type: Date,
    nullable: true,
    example: '2026-08-01T11:50:00.000Z',
  })
  @AutoMap()
  actualEndTime: Date | null;

  @ApiProperty({
    description: 'Status of the mission',
    enum: MissionStatus,
    enumName: 'MissionStatus',
    example: MissionStatus.COMPLETED,
  })
  @AutoMap()
  status: MissionStatus;

  @ApiProperty({
    description: 'Flight hours logged at mission completion',
    example: 3.75,
  })
  @AutoMap()
  flightHoursAtCompletion: number;

  @ApiProperty({
    description: 'Reason for aborting the mission, if applicable',
    type: String,
    nullable: true,
    example: null,
  })
  @AutoMap()
  abortReason: string | null;

  @ApiProperty({
    description: 'Record creation timestamp',
    type: Date,
    example: '2026-01-01T00:00:00.000Z',
  })
  @AutoMap()
  createdAt: Date;

  @ApiProperty({
    description: 'Record update timestamp',
    type: Date,
    example: '2026-08-01T12:00:00.000Z',
  })
  @AutoMap()
  updatedAt: Date;
}