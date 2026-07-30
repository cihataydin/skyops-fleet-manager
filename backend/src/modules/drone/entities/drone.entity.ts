import { Entity, Column, OneToMany, BeforeInsert } from 'typeorm';
import { Mission } from '@/modules/mission/entities';
import { MaintenanceLog } from '@/modules/maintenance/entities';
import { DroneModel, DroneStatus } from '@/modules/drone/enums';
import { BaseEntity } from '@/infra/db/entities';
import { AutoMap } from '@automapper/classes';
import { MAINTENANCE_INTERVAL_MS } from '@/shared/constants';

@Entity('drones')
export class Drone extends BaseEntity {
  @AutoMap()
  @Column({
    unique: true,
    name: 'serial_number',
    length: 13,
  })
  serialNumber: string;

  @AutoMap()
  @Column({
    type: 'enum',
    enum: DroneModel,
  })
  model: DroneModel;

  @AutoMap()
  @Column({
    type: 'enum',
    enum: DroneStatus,
    default: DroneStatus.AVAILABLE,
  })
  status: DroneStatus;

  @AutoMap()
  @Column({
    type: 'decimal',
    name: 'total_flight_hours',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalFlightHours: number;

  @AutoMap()
  @Column({
    type: 'decimal',
    name: 'flight_hours_at_last_maintenance',
    precision: 10,
    scale: 2,
    default: 0,
  })
  flightHoursAtLastMaintenance: number;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    name: 'last_maintenance_date',
    nullable: true,
  })
  lastMaintenanceDate: Date;

  @AutoMap()
  @Column({
    type: 'timestamptz',
    name: 'next_maintenance_due_date',
  })
  nextMaintenanceDueDate: Date;

  @OneToMany(() => Mission, (mission) => mission.drone)
  missions: Mission[];

  @OneToMany(() => MaintenanceLog, (log) => log.drone)
  maintenanceLogs: MaintenanceLog[];

  @BeforeInsert()
  public beforeInsertEntity() {
    this.nextMaintenanceDueDate = new Date(
      Date.now() + MAINTENANCE_INTERVAL_MS,
    );
  }
}
