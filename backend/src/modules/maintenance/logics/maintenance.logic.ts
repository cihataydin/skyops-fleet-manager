import { DomainException } from '@/shared/exceptions';
import { MAINTENANCE_FLIGHT_HOURS_TOLERANCE } from '@/shared/constants';

export class MaintenanceLogic {
  public static validateFlightHoursAtMaintenance(
    flightHoursAtMaintenance: number,
    droneTotalFlightHours: number,
    toleranceHours: number = MAINTENANCE_FLIGHT_HOURS_TOLERANCE,
  ): void {
    const difference = Math.abs(
      Number(flightHoursAtMaintenance) - Number(droneTotalFlightHours),
    );

    if (difference > toleranceHours) {
      throw new DomainException(
        `Recorded flight hours at maintenance (${flightHoursAtMaintenance}h) is inconsistent with drone total flight hours (${droneTotalFlightHours}h). Allowed tolerance is +/- ${toleranceHours}h.`,
      );
    }
  }
}
