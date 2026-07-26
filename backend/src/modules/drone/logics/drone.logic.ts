import { Drone } from '@/modules/drone/entities';
import { MAINTENANCE_INTERVAL_FLIGHT_HOURS, MAINTENANCE_INTERVAL_MS } from '@/shared/constants';

export class DroneLogic {
  public static updateMaintenanceTrackingDates(
    drone: Drone, 
    performedAt: Date
  ): void {
    drone.lastMaintenanceDate = new Date(performedAt);
    drone.nextMaintenanceDueDate = new Date(
      drone.lastMaintenanceDate.getTime() + MAINTENANCE_INTERVAL_MS,
    );
  }

  public static isFlightHoursExceeded(drone: Drone): boolean {
    return Number(drone.totalFlightHours) > MAINTENANCE_INTERVAL_FLIGHT_HOURS;
  }
}
