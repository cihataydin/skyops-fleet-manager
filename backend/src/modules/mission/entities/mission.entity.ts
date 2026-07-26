import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Drone } from '@/modules/drone/entities/drone.entity';
import { MissionType, MissionStatus } from '@/modules/mission/enums';
import { BaseEntity } from '@/infra/db/entities';
import { AutoMap } from '@automapper/classes';

@Entity('missions')
export class Mission extends BaseEntity {
  @AutoMap()
  @Column({ 
    type: 'varchar', 
    length: 255 
  })
  name: string;

  @AutoMap()
  @Column({ 
    type: 'enum', 
    enum: MissionType 
  })
  type: MissionType;

  @AutoMap()
  @Column({ 
    type: 'uuid', 
    name: 'drone_id' 
  })
  droneId: string;

  @AutoMap()
  @Column({ 
    type: 'varchar', 
    name: 'pilot_name', 
    length: 255 
  })
  pilotName: string;

  @AutoMap()
  @Column({ 
    type: 'varchar', 
    name: 'site_location', 
    length: 255 
  })
  siteLocation: string;

  @AutoMap()
  @Column({ 
    type: 'timestamptz', 
    name: 'scheduled_start_time' 
  })
  scheduledStartTime: Date;

  @AutoMap()
  @Column({ 
    type: 'timestamptz', 
    name: 'scheduled_end_time' 
  })
  scheduledEndTime: Date;

  @AutoMap()
  @Column({ 
    type: 'timestamptz', 
    name: 'actual_start_time', 
    nullable: true 
  })
  actualStartTime: Date;

  @AutoMap()
  @Column({ 
    type: 'timestamptz', 
    name: 'actual_end_time', 
    nullable: true 
  })
  actualEndTime: Date;

  @AutoMap()
  @Column({ 
    type: 'enum', 
    enum: MissionStatus, 
    default: MissionStatus.PLANNED 
  })
  status: MissionStatus;

  // TODO: upon completion
  @AutoMap()
  @Column({ 
    type: 'decimal', 
    name: 'flight_hours_at_completion', 
    precision: 10, 
    scale: 2, 
    default: 0 
  })
  flightHoursAtCompletion: number;

  @AutoMap()
  @Column({ 
    type: 'varchar', 
    name: 'abort_reason', 
    length: 255, 
    nullable: true 
  })
  abortReason: string;

  @ManyToOne(() => Drone, (drone) => drone.missions, { onDelete: 'RESTRICT' }) 
  @JoinColumn({ name: 'drone_id' })
  drone: Drone;

  /*
  TODO:
  • Missions must follow the valid state transitions shown above.
  • When a mission starts (IN_PROGRESS), the drone status should
    reflect that it is in use.
  • When a mission is completed, flight hours must be logged and
    added to the drone's total. The system should check if
    maintenance is now due.
  • Aborting a mission requires a reason. The drone should become
    available again.
  • A drone cannot have overlapping missions (by scheduled time).
  • Missions cannot be scheduled in the past.

  Mission Lifecycle
  PLANNED --> PRE_FLIGHT_CHECK --> IN_PROGRESS --> COMPLETED
      |             |                   |
      v             v                   v
    ABORTED       ABORTED             ABORTED
  */
}
