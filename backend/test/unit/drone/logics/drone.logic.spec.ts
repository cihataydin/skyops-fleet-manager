import { DroneLogic } from '@/modules/drone/logics/drone.logic';
import { Drone } from '@/modules/drone/entities';
import { DroneStatus } from '@/modules/drone/enums';
import { DomainException } from '@/shared/exceptions';
import {
  MAINTENANCE_INTERVAL_FLIGHT_HOURS,
  MAINTENANCE_INTERVAL_MS,
} from '@/shared/constants';

describe('DroneLogic', () => {
  describe('validateManualStatusUpdate', () => {
    it('should not throw if target status is undefined', () => {
      expect(() =>
        DroneLogic.validateManualStatusUpdate(
          DroneStatus.AVAILABLE,
          undefined,
          true,
          'drone-1',
        ),
      ).not.toThrow();
    });

    it('should throw if target status is same as current', () => {
      expect(() =>
        DroneLogic.validateManualStatusUpdate(
          DroneStatus.AVAILABLE,
          DroneStatus.AVAILABLE,
          true,
          'drone-1',
        ),
      ).toThrow(DomainException);
    });

    it('should throw if setting to IN_MISSION status from MAINTENANCE', () => {
      expect(() =>
        DroneLogic.validateManualStatusUpdate(
          DroneStatus.MAINTENANCE,
          DroneStatus.IN_MISSION,
          false,
          'drone-1',
        ),
      ).toThrow();
    });

    it('should throw if not setting from MAINTENANCE or AVAILABLE', () => {
      expect(() =>
        DroneLogic.validateManualStatusUpdate(
          DroneStatus.IN_MISSION,
          DroneStatus.AVAILABLE,
          false,
          'drone-1',
        ),
      ).toThrow();
      expect(() =>
        DroneLogic.validateManualStatusUpdate(
          DroneStatus.RETIRED,
          DroneStatus.AVAILABLE,
          false,
          'drone-1',
        ),
      ).toThrow();
    });

    it('should throw if setting to RETIRED and has upcoming missions', () => {
      expect(() =>
        DroneLogic.validateManualStatusUpdate(
          DroneStatus.AVAILABLE,
          DroneStatus.RETIRED,
          true,
          'drone-1',
        ),
      ).toThrow(DomainException);
    });

    it('should not throw if setting to another status from AVAILABLE with no upcoming missions', () => {
      expect(() =>
        DroneLogic.validateManualStatusUpdate(
          DroneStatus.AVAILABLE,
          DroneStatus.RETIRED,
          false,
          'drone-1',
        ),
      ).not.toThrow();
      expect(() =>
        DroneLogic.validateManualStatusUpdate(
          DroneStatus.AVAILABLE,
          DroneStatus.MAINTENANCE,
          false,
          'drone-1',
        ),
      ).not.toThrow();
      expect(() =>
        DroneLogic.validateManualStatusUpdate(
          DroneStatus.AVAILABLE,
          DroneStatus.IN_MISSION,
          false,
          'drone-1',
        ),
      ).not.toThrow();
    });

    it('should not throw if not setting to RETIRED and has upcoming missions', () => {
      expect(() =>
        DroneLogic.validateManualStatusUpdate(
          DroneStatus.AVAILABLE,
          DroneStatus.MAINTENANCE,
          true,
          'drone-1',
        ),
      ).not.toThrow();
    });

    it('should not throw if setting to an status from MAINTENANCE or AVAILABLE', () => {
      expect(() => 
        DroneLogic.validateManualStatusUpdate(
          DroneStatus.MAINTENANCE, 
          DroneStatus.AVAILABLE, 
          false, 'drone-1'
        ),
      ).not.toThrow();
      expect(() => 
        DroneLogic.validateManualStatusUpdate(
          DroneStatus.AVAILABLE, 
          DroneStatus.RETIRED, 
          false, 
          'drone-1'
        )
      ).not.toThrow();
    });
  });

  describe('updateMaintenanceTrackingDates', () => {
    it('should correctly update maintenance dates and flight hours', () => {
      const drone = {
        lastMaintenanceDate: new Date('2026-01-01T00:00:00Z'),
        nextMaintenanceDueDate: new Date('2026-02-01T00:00:00Z'),
        totalFlightHours: 120,
        flightHoursAtLastMaintenance: 50,
      } as Drone;

      const performedAt = new Date('2026-06-01T00:00:00Z');
      
      DroneLogic.updateMaintenanceTrackingDates(drone, performedAt);

      expect(drone.lastMaintenanceDate).toEqual(performedAt);
      expect(drone.flightHoursAtLastMaintenance).toBe(120);
      expect(drone.nextMaintenanceDueDate.getTime()).toBe(performedAt.getTime() + MAINTENANCE_INTERVAL_MS);
    });
  });

  describe('isFlightHoursExceeded', () => {
    it('should return true if flight hours since last maintenance exceed or equal the interval', () => {
      expect(DroneLogic.isFlightHoursExceeded(100, 100 - MAINTENANCE_INTERVAL_FLIGHT_HOURS)).toBe(true);
      expect(DroneLogic.isFlightHoursExceeded(120, 120 - MAINTENANCE_INTERVAL_FLIGHT_HOURS - 10)).toBe(true);
    });

    it('should return false if flight hours since last maintenance do not exceed the interval', () => {
      expect(DroneLogic.isFlightHoursExceeded(80, 80 - MAINTENANCE_INTERVAL_FLIGHT_HOURS + 10)).toBe(false);
    });

    it('should handle undefined or null flightHoursAtLastMaintenance as 0', () => {
      expect(DroneLogic.isFlightHoursExceeded(MAINTENANCE_INTERVAL_FLIGHT_HOURS + 10, undefined as any)).toBe(true);
      expect(DroneLogic.isFlightHoursExceeded(MAINTENANCE_INTERVAL_FLIGHT_HOURS - 10, null as any)).toBe(false);
    });
  });

  describe('calculateStatusBreakdown', () => {
    it('should return an empty object for an empty array of drones', () => {
      const result = DroneLogic.calculateStatusBreakdown([]);
      expect(result).toEqual({});
    });

    it('should correctly calculate the breakdown of drone statuses', () => {
      const drones = [
        { status: DroneStatus.AVAILABLE },
        { status: DroneStatus.AVAILABLE },
        { status: DroneStatus.MAINTENANCE },
        { status: DroneStatus.IN_MISSION },
      ] as Drone[];

      const result = DroneLogic.calculateStatusBreakdown(drones);

      expect(result).toEqual({
        [DroneStatus.AVAILABLE]: 2,
        [DroneStatus.MAINTENANCE]: 1,
        [DroneStatus.IN_MISSION]: 1,
      });
    });
  });

  describe('calculateAverageFlightHours', () => {
    it('should return 0 if the drones array is empty', () => {
      const result = DroneLogic.calculateAverageFlightHours([]);
      expect(result).toBe(0);
    });

    it('should correctly calculate the average flight hours', () => {
      const drones = [
        { totalFlightHours: 100 },
        { totalFlightHours: 200 },
        { totalFlightHours: 150 },
      ] as Drone[];

      const result = DroneLogic.calculateAverageFlightHours(drones);
      expect(result).toBe(150);
    });

    it('should handle undefined or null totalFlightHours as 0', () => {
      const drones = [
        { totalFlightHours: 100 },
        { totalFlightHours: undefined },
      ] as any[];

      const result = DroneLogic.calculateAverageFlightHours(drones);
      expect(result).toBe(50);
    });
  });
});
