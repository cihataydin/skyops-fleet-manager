import { Drone } from '@/modules/drone/entities';
import { DroneStatus } from '@/modules/drone/enums';
import { MAINTENANCE_INTERVAL_FLIGHT_HOURS, MAINTENANCE_INTERVAL_MS } from '@/shared/constants';
import { DomainException } from '@/shared/exceptions';

export class DroneLogic {
  public static validateRetirement(
    targetStatus: DroneStatus | undefined,
    hasUpcomingMissions: boolean,
    droneId: string,
  ): void {
    if (targetStatus === DroneStatus.RETIRED && hasUpcomingMissions) {
      throw new DomainException(
        `Drone '${droneId}' cannot be retired because it has upcoming scheduled missions. Please reassign or abort them first.`,
      );
    }
  }

  public static updateMaintenanceTrackingDates(
    drone: Drone, 
    performedAt: Date,
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
