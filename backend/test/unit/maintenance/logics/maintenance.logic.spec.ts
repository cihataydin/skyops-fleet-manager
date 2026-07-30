import { MaintenanceLogic } from '@/modules/maintenance/logics/maintenance.logic';
import { DomainException } from '@/shared/exceptions';
import { MAINTENANCE_FLIGHT_HOURS_TOLERANCE } from '@/shared/constants';

describe('MaintenanceLogic', () => {
  describe('validateFlightHoursAtMaintenance', () => {
    it('should not throw if the difference is exactly zero', () => {
      expect(() =>
        MaintenanceLogic.validateFlightHoursAtMaintenance(100, 100),
      ).not.toThrow();
    });

    it('should not throw if the difference is within the positive tolerance', () => {
      const droneHours = 100;
      const recordedHours = droneHours + MAINTENANCE_FLIGHT_HOURS_TOLERANCE;
      expect(() =>
        MaintenanceLogic.validateFlightHoursAtMaintenance(
          recordedHours,
          droneHours,
        ),
      ).not.toThrow();
    });

    it('should not throw if the difference is within the negative tolerance', () => {
      const droneHours = 100;
      const recordedHours = droneHours - MAINTENANCE_FLIGHT_HOURS_TOLERANCE;
      expect(() =>
        MaintenanceLogic.validateFlightHoursAtMaintenance(
          recordedHours,
          droneHours,
        ),
      ).not.toThrow();
    });

    it('should throw DomainException if the recorded hours exceed the positive tolerance limit', () => {
      const droneHours = 100;
      const recordedHours =
        droneHours + MAINTENANCE_FLIGHT_HOURS_TOLERANCE + 0.1;
      expect(() =>
        MaintenanceLogic.validateFlightHoursAtMaintenance(
          recordedHours,
          droneHours,
        ),
      ).toThrow(DomainException);
    });

    it('should throw DomainException if the recorded hours exceed the negative tolerance limit', () => {
      const droneHours = 100;
      const recordedHours =
        droneHours - MAINTENANCE_FLIGHT_HOURS_TOLERANCE - 0.1;
      expect(() =>
        MaintenanceLogic.validateFlightHoursAtMaintenance(
          recordedHours,
          droneHours,
        ),
      ).toThrow(DomainException);
    });

    it('should allow custom tolerance to override the default', () => {
      const droneHours = 100;
      const recordedHours = 110;
      const customTolerance = 15;

      expect(() =>
        MaintenanceLogic.validateFlightHoursAtMaintenance(
          recordedHours,
          droneHours,
          customTolerance,
        ),
      ).not.toThrow();

      expect(() =>
        MaintenanceLogic.validateFlightHoursAtMaintenance(
          120,
          droneHours,
          customTolerance,
        ),
      ).toThrow(DomainException);
    });
  });
});
