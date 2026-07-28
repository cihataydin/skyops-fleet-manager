import { DroneLogic } from '@/modules/drone/logics/drone.logic';
import { Drone } from '@/modules/drone/entities';
import { DroneStatus } from '@/modules/drone/enums';
import { DomainException } from '@/shared/exceptions';
import { MAINTENANCE_INTERVAL_FLIGHT_HOURS, MAINTENANCE_INTERVAL_MS } from '@/shared/constants';

describe('DroneLogic', () => {
  describe('validateRetirement', () => {
    it('should not throw if not retiring', () => {
      expect(() => DroneLogic.validateRetirement(DroneStatus.AVAILABLE, true, 'drone-1')).not.toThrow();
    });

    it('should not throw if retiring and has no upcoming missions', () => {
      expect(() => DroneLogic.validateRetirement(DroneStatus.RETIRED, false, 'drone-1')).not.toThrow();
    });

    it('should throw if retiring and has upcoming missions', () => {
      expect(() => DroneLogic.validateRetirement(DroneStatus.RETIRED, true, 'drone-1')).toThrow(DomainException);
    });
  });

  describe('updateMaintenanceTrackingDates', () => {
    it('should correctly calculate next maintenance date and reset hours', () => {
      const drone = new Drone();
      drone.totalFlightHours = 120;
      
      const performedAt = new Date('2026-07-28T12:00:00Z');
      DroneLogic.updateMaintenanceTrackingDates(drone, performedAt);
      
      expect(drone.lastMaintenanceDate).toEqual(performedAt);
      const expectedNext = new Date(performedAt.getTime() + MAINTENANCE_INTERVAL_MS);
      expect(drone.nextMaintenanceDueDate).toEqual(expectedNext);
      expect(drone.flightHoursAtLastMaintenance).toBe(120);
    });
  });

  describe('isFlightHoursExceeded', () => {
    it('should return false if hours since last maintenance are less than threshold', () => {
      const totalHours = 100;
      const lastMaintenanceHours = 100 - MAINTENANCE_INTERVAL_FLIGHT_HOURS + 1;
      expect(DroneLogic.isFlightHoursExceeded(totalHours, lastMaintenanceHours)).toBe(false);
    });

    it('should return true if hours since last maintenance equal or exceed threshold', () => {
      const totalHours = 100;
      const lastMaintenanceHours = 100 - MAINTENANCE_INTERVAL_FLIGHT_HOURS;
      expect(DroneLogic.isFlightHoursExceeded(totalHours, lastMaintenanceHours)).toBe(true);
      
      expect(DroneLogic.isFlightHoursExceeded(totalHours, lastMaintenanceHours - 5)).toBe(true);
    });
  });
});
