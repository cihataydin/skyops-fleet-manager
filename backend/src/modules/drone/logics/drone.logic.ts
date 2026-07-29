import { Drone } from '@/modules/drone/entities';
import { DroneStatus } from '@/modules/drone/enums';
import { MAINTENANCE_INTERVAL_FLIGHT_HOURS, MAINTENANCE_INTERVAL_MS } from '@/shared/constants';
import { DomainException } from '@/shared/exceptions';

export class DroneLogic {
  public static validateManualStatusUpdate(
    currentStatus: DroneStatus,
    targetStatus: DroneStatus | undefined,
    hasUpcomingMissions: boolean,
    droneId: string,
  ): void {
    if (!targetStatus) return;

    if (currentStatus === targetStatus) {
      throw new DomainException(
        `Drone '${droneId}' is already in '${currentStatus}' status.`,
      );
    }

    if (currentStatus !== DroneStatus.AVAILABLE) {
      throw new DomainException(
        `Drone '${droneId}' cannot be manually set to ${targetStatus} unless its current status is ${DroneStatus.AVAILABLE}. Current status is ${currentStatus}.`,
      );
    }

    if (hasUpcomingMissions && targetStatus === DroneStatus.RETIRED) {
      throw new DomainException(
        `Drone '${droneId}' cannot be set to ${targetStatus} because it has upcoming scheduled missions. Please reassign or abort them first.`,
      );
    }
  }

  public static updateMaintenanceTrackingDates(
    drone: Drone, 
    performedAt: Date,
  ): void {
    drone.lastMaintenanceDate = performedAt;
    drone.nextMaintenanceDueDate = new Date(
      drone.lastMaintenanceDate.getTime() + MAINTENANCE_INTERVAL_MS,
    );
    drone.flightHoursAtLastMaintenance = Number(drone.totalFlightHours);
  }

  public static isFlightHoursExceeded(totalFlightHours: number, flightHoursAtLastMaintenance: number): boolean {
    const hoursSinceLastMaintenance = Number(totalFlightHours) - Number(flightHoursAtLastMaintenance || 0);
    return hoursSinceLastMaintenance >= MAINTENANCE_INTERVAL_FLIGHT_HOURS;
  }

  public static calculateStatusBreakdown(drones: Drone[]): Record<string, number> {
    return drones.reduce((acc, drone) => {
      acc[drone.status] = (acc[drone.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  public static calculateAverageFlightHours(drones: Drone[]): number {
    if (drones.length === 0) return 0;
    const totalHours = drones.reduce((sum, drone) => sum + Number(drone.totalFlightHours || 0), 0);
    return totalHours / drones.length;
  }
}
