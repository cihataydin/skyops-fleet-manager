import { Entity, Column, OneToMany, BeforeUpdate, BeforeInsert } from 'typeorm';
import { Mission } from '@/modules/mission/entities';
import { MaintenanceLog } from '@/modules/maintenance/entities';
import { DroneModel, DroneStatus } from '@/modules/drone/enums';
import { BaseEntity } from '@/infra/db/entities';
import { AutoMap } from '@automapper/classes';

@Entity('drones')
export class Drone extends BaseEntity {

  // TODO: Domain bussiness; SKY-XXXX-XXXX where X is alphanumeric
  @AutoMap()
  @Column({ 
    unique: true, 
    name: 'serial_number', 
    length: 13 
  })
  serialNumber: string; 

  @AutoMap()
  @Column({ 
    type: 'enum', 
    enum: DroneModel 
  })
  model: DroneModel;

  @AutoMap()
  @Column({ 
    type: 'enum', 
    enum: DroneStatus, 
    default: DroneStatus.AVAILABLE 
  })
  status: DroneStatus;

  // TODO: transformation of minutes to hours ?
  @AutoMap()
  @Column({ 
    type: 'decimal', 
    name: 'total_flight_hours', 
    precision: 10, 
    scale: 2, 
    default: 0 
  })
  totalFlightHours: number;

  // TODO: how to get this?
  @AutoMap()
  @Column({ 
    type: 'timestamptz', 
    name: 'last_maintenance_date', 
    nullable: true 
  })
  lastMaintenanceDate: Date;

  @AutoMap()
  @Column({ 
    type: 'timestamptz', 
    name: 'next_maintenance_due_date' 
  })
  nextMaintenanceDueDate: Date;

  // TODO: registration timestamp should be included or just use createdAt from BaseEntity?

  @OneToMany(() => Mission, (mission) => mission.drone)
  missions: Mission[];

  @OneToMany(() => MaintenanceLog, (log) => log.drone)
  maintenanceLogs: MaintenanceLog[];

  @BeforeInsert()
  public beforeInsertEntity() {
    this.nextMaintenanceDueDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // Set next maintenance due date to 90 days from now
  }

  /*
  TODO:
  Constraints:
  - Maintenance is required every 50 flight hours OR every 90 days, whichever comes first. 
    The next maintenance due date should be calculated automatically.
  - Only drones with AVAILABLE status can be assigned to missions.
  - A drone with upcoming scheduled missions cannot be retired.
  */
}
