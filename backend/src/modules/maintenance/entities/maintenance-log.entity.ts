import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Drone } from '@/modules/drone/entities/drone.entity';
import { MaintenanceType } from '@/modules/maintenance/enums';
import { BaseEntity } from '@/infra/db/entities';

@Entity('maintenance_logs')
export class MaintenanceLog extends BaseEntity {
  @Column({ 
    type: 'uuid', 
    name: 'drone_id' 
  })
  droneId: string;

  @Column({ 
    type: 'enum', 
    enum: MaintenanceType 
  })
  type: MaintenanceType;

  @Column({ 
    type: 'varchar',
    name: 'technician_name', 
    length: 255
  })
  technicianName: string;

  @Column({ 
    type: 'varchar', 
    length: 500, 
    nullable: true 
  })
  notes: string;

  @Column({ 
    type: 'timestamptz', 
    name: 'performed_at' 
  })
  performedAt: Date;

  @Column({ 
    type: 'decimal', 
    name: 'flight_hours_at_maintenance', 
    precision: 10, 
    scale: 2 
  })
  flightHoursAtMaintenance: number;

  @ManyToOne(() => Drone, (drone) => drone.maintenanceLogs, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'drone_id' })
  drone: Drone;

  /* TODO:
  • Creating a maintenance log should update the drone's
    maintenance tracking dates.
  • The drone's status should reflect when it is under maintenance.
  • The recorded flight hours at maintenance should be consistent
    with the drone's actual total flight hours (within a reasonable
    tolerance).
  */
}
