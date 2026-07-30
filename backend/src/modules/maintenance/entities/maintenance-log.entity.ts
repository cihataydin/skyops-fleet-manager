import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Drone } from '@/modules/drone/entities/drone.entity';
import { MaintenanceType } from '@/modules/maintenance/enums';
import { BaseEntity } from '@/infra/db/entities';
import { AutoMap } from '@automapper/classes';

@Entity('maintenance_logs')
export class MaintenanceLog extends BaseEntity {
  @AutoMap()
  @Column({
    type: 'uuid',
    name: 'drone_id',
  })
  droneId: string;

  @AutoMap()
  @Column({
    type: 'enum',
    enum: MaintenanceType,
  })
  type: MaintenanceType;

  @AutoMap()
  @Column({
    type: 'varchar',
    name: 'technician_name',
    length: 255,
  })
  technicianName: string;

  @AutoMap()
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  notes: string;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    name: 'performed_at',
  })
  performedAt: Date;

  @AutoMap()
  @Column({
    type: 'decimal',
    name: 'flight_hours_at_maintenance',
    precision: 10,
    scale: 2,
  })
  flightHoursAtMaintenance: number;

  @ManyToOne(() => Drone, (drone) => drone.maintenanceLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'drone_id' })
  drone: Drone;
}
