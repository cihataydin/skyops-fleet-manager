import { ApiProperty } from '@nestjs/swagger';
import { MissionType, MissionStatus } from '@/modules/mission/enums';
import { AutoMap } from '@automapper/classes';

export class CreateMissionResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the mission',
  })
  @AutoMap()
  id: string;

  @ApiProperty({
    description: 'Name of the mission',
  })
  @AutoMap()
  name: string;

  @ApiProperty({
    description: 'Type of the mission',
    enum: MissionType,
  })
  @AutoMap()
  type: MissionType;

  @ApiProperty({
    description: 'UUID of the assigned drone',
  })
  @AutoMap()
  droneId: string;

  @ApiProperty({
    description: 'Name of the assigned pilot',
  })
  @AutoMap()
  pilotName: string;

  @ApiProperty({
    description: 'Location or site of the mission',
  })
  @AutoMap()
  siteLocation: string;

  @ApiProperty({
    description: 'Scheduled start time of the mission',
  })
  @AutoMap()
  scheduledStartTime: Date;

  @ApiProperty({
    description: 'Scheduled end time of the mission',
  })
  @AutoMap()
  scheduledEndTime: Date;

  @ApiProperty({
    description: 'Actual start time of the mission',
  })
  @AutoMap()
  actualStartTime: Date | null;

  @ApiProperty({
    description: 'Actual end time of the mission',
  })
  @AutoMap()
  actualEndTime: Date | null;

  @ApiProperty({
    description: 'Status of the mission',
    enum: MissionStatus,
  })
  @AutoMap()
  status: MissionStatus;

  @ApiProperty({
    description: 'Flight hours logged at mission completion',
  })
  @AutoMap()
  flightHoursAtCompletion: number;

  @ApiProperty({
    description: 'Reason for aborting the mission, if applicable',
  })
  @AutoMap()
  abortReason: string | null;

  @ApiProperty({
    description: 'Record creation timestamp',
  })
  @AutoMap()
  createdAt: Date;
}