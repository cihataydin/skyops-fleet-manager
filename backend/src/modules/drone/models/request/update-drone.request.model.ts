import { DroneModel, DroneStatus } from '@/modules/drone/enums';
import { AutoMap } from '@automapper/classes';

export class UpdateDroneRequestModel {
  @AutoMap()
  model?: DroneModel;

  @AutoMap()
  status?: DroneStatus;

  @AutoMap()
  totalFlightHours?: number;

  @AutoMap()
  flightHoursAtLastMaintenance?: number;
}
