import { MissionLogic } from '@/modules/mission/logics/mission.logic';
import { Mission } from '@/modules/mission/entities';
import { MissionStatus } from '@/modules/mission/enums';
import { DroneStatus } from '@/modules/drone/enums';
import { DomainException } from '@/shared/exceptions';

describe('MissionLogic', () => {
  describe('validateDroneAvailability', () => {
    it('should not throw if drone status is AVAILABLE', () => {
      expect(() =>
        MissionLogic.validateDroneAvailability(DroneStatus.AVAILABLE, 'drone-1'),
      ).not.toThrow();
    });

    it('should throw DomainException if drone status is not AVAILABLE', () => {
      expect(() =>
        MissionLogic.validateDroneAvailability(DroneStatus.IN_MISSION, 'drone-1'),
      ).toThrow(DomainException);
      expect(() =>
        MissionLogic.validateDroneAvailability(DroneStatus.MAINTENANCE, 'drone-1'),
      ).toThrow(DomainException);
    });
  });

  describe('validateStatusTransition', () => {
    it('should not throw if currentStatus equals targetStatus', () => {
      expect(() =>
        MissionLogic.validateStatusTransition(MissionStatus.PLANNED, MissionStatus.PLANNED),
      ).not.toThrow();
    });

    it('should allow valid transitions', () => {
      expect(() => MissionLogic.validateStatusTransition(MissionStatus.PLANNED, MissionStatus.PRE_FLIGHT_CHECK)).not.toThrow();
      expect(() => MissionLogic.validateStatusTransition(MissionStatus.PLANNED, MissionStatus.ABORTED)).not.toThrow();
      expect(() => MissionLogic.validateStatusTransition(MissionStatus.PRE_FLIGHT_CHECK, MissionStatus.IN_PROGRESS)).not.toThrow();
      expect(() => MissionLogic.validateStatusTransition(MissionStatus.PRE_FLIGHT_CHECK, MissionStatus.ABORTED)).not.toThrow();
      expect(() => MissionLogic.validateStatusTransition(MissionStatus.IN_PROGRESS, MissionStatus.COMPLETED)).not.toThrow();
      expect(() => MissionLogic.validateStatusTransition(MissionStatus.IN_PROGRESS, MissionStatus.ABORTED)).not.toThrow();
    });

    it('should throw DomainException for invalid transitions', () => {
      expect(() => MissionLogic.validateStatusTransition(MissionStatus.PLANNED, MissionStatus.IN_PROGRESS)).toThrow(DomainException);
      expect(() => MissionLogic.validateStatusTransition(MissionStatus.PLANNED, MissionStatus.COMPLETED)).toThrow(DomainException);
      expect(() => MissionLogic.validateStatusTransition(MissionStatus.PRE_FLIGHT_CHECK, MissionStatus.COMPLETED)).toThrow(DomainException);
      expect(() => MissionLogic.validateStatusTransition(MissionStatus.COMPLETED, MissionStatus.IN_PROGRESS)).toThrow(DomainException);
      expect(() => MissionLogic.validateStatusTransition(MissionStatus.ABORTED, MissionStatus.IN_PROGRESS)).toThrow(DomainException);
    });
  });

  describe('startMission', () => {
    it('should set actualStartTime and IN_PROGRESS status', () => {
      const mission = new Mission();
      mission.status = MissionStatus.PRE_FLIGHT_CHECK;
      
      MissionLogic.startMission(mission);
      
      expect(mission.status).toBe(MissionStatus.IN_PROGRESS);
      expect(mission.actualStartTime).toBeInstanceOf(Date);
    });

    it('should throw if mission already has actualStartTime', () => {
      const mission = new Mission();
      mission.actualStartTime = new Date();
      
      expect(() => MissionLogic.startMission(mission)).toThrow(DomainException);
    });
  });

  describe('completeMission', () => {
    it('should set actualEndTime, flightHoursAtCompletion, and COMPLETED status', () => {
      const mission = new Mission();
      mission.status = MissionStatus.IN_PROGRESS;
      
      MissionLogic.completeMission(mission, 10);
      
      expect(mission.status).toBe(MissionStatus.COMPLETED);
      expect(mission.actualEndTime).toBeInstanceOf(Date);
      expect(mission.flightHoursAtCompletion).toBe(10);
    });

    it('should throw if flightHoursAtCompletion is invalid or zero', () => {
      const mission = new Mission();
      expect(() => MissionLogic.completeMission(mission, 0)).toThrow(DomainException);
      expect(() => MissionLogic.completeMission(mission, -5)).toThrow(DomainException);
      expect(() => MissionLogic.completeMission(mission, undefined)).toThrow(DomainException);
    });
  });

  describe('abortMission', () => {
    it('should set actualEndTime, abortReason, and ABORTED status', () => {
      const mission = new Mission();
      mission.status = MissionStatus.IN_PROGRESS;
      
      MissionLogic.abortMission(mission, 'Weather conditions');
      
      expect(mission.status).toBe(MissionStatus.ABORTED);
      expect(mission.actualEndTime).toBeInstanceOf(Date);
      expect(mission.abortReason).toBe('Weather conditions');
    });

    it('should throw if abortReason is missing or empty', () => {
      const mission = new Mission();
      expect(() => MissionLogic.abortMission(mission)).toThrow(DomainException);
      expect(() => MissionLogic.abortMission(mission, '   ')).toThrow(DomainException);
    });
  });

  describe('preFlightCheckMission', () => {
    it('should set status to PRE_FLIGHT_CHECK', () => {
      const mission = new Mission();
      mission.status = MissionStatus.PLANNED;
      
      MissionLogic.preFlightCheckMission(mission);
      
      expect(mission.status).toBe(MissionStatus.PRE_FLIGHT_CHECK);
    });
  });

  describe('handleStatusChange', () => {
    let mission: Mission;

    beforeEach(() => {
      mission = new Mission();
      mission.id = 'm1';
      mission.status = MissionStatus.PLANNED;
    });

    it('should throw if status is not changed', () => {
      expect(() => MissionLogic.handleStatusChange(mission, MissionStatus.PLANNED)).toThrow(DomainException);
      expect(() => MissionLogic.handleStatusChange(mission, undefined)).toThrow(DomainException);
    });

    it('should delegate to startMission when target is IN_PROGRESS', () => {
      mission.status = MissionStatus.PRE_FLIGHT_CHECK;
      MissionLogic.handleStatusChange(mission, MissionStatus.IN_PROGRESS);
      expect(mission.status).toBe(MissionStatus.IN_PROGRESS);
    });

    it('should delegate to completeMission when target is COMPLETED', () => {
      mission.status = MissionStatus.IN_PROGRESS;
      MissionLogic.handleStatusChange(mission, MissionStatus.COMPLETED, 5);
      expect(mission.status).toBe(MissionStatus.COMPLETED);
    });

    it('should delegate to abortMission when target is ABORTED', () => {
      mission.status = MissionStatus.IN_PROGRESS;
      MissionLogic.handleStatusChange(mission, MissionStatus.ABORTED, undefined, 'Engine failure');
      expect(mission.status).toBe(MissionStatus.ABORTED);
    });

    it('should delegate to preFlightCheckMission when target is PRE_FLIGHT_CHECK', () => {
      MissionLogic.handleStatusChange(mission, MissionStatus.PRE_FLIGHT_CHECK);
      expect(mission.status).toBe(MissionStatus.PRE_FLIGHT_CHECK);
    });
  });

  describe('isStatusChanged', () => {
    it('should return true if newStatus is provided and different from current status', () => {
      expect(MissionLogic.isStatusChanged(MissionStatus.PLANNED, MissionStatus.IN_PROGRESS)).toBe(true);
    });

    it('should return false if status or newStatus is missing or same as each other', () => {
      expect(MissionLogic.isStatusChanged(MissionStatus.PLANNED, MissionStatus.PLANNED)).toBe(false);
      expect(MissionLogic.isStatusChanged(MissionStatus.PLANNED, undefined)).toBe(false);
      expect(MissionLogic.isStatusChanged(undefined, MissionStatus.PLANNED)).toBe(false);
    });
  });

  describe('calculateFutureDate', () => {
    it('should return a future date correctly calculated based on hours to add', () => {
      const now = new Date();
      const hoursToAdd = 5;
      const futureDate = MissionLogic.calculateFutureDate(hoursToAdd);
      
      const expectedTime = now.getTime() + hoursToAdd * 60 * 60 * 1000;
      expect(futureDate.getTime()).toBeCloseTo(expectedTime, -2);
    });
  });

  describe('validateDroneStateForMissionStart', () => {
    it('should throw if trying to start/pre-flight a mission with a drone in MAINTENANCE or RETIRED', () => {
      expect(() => MissionLogic.validateDroneStateForMissionStart(MissionStatus.PRE_FLIGHT_CHECK, DroneStatus.MAINTENANCE)).toThrow(DomainException);
      expect(() => MissionLogic.validateDroneStateForMissionStart(MissionStatus.IN_PROGRESS, DroneStatus.RETIRED)).toThrow(DomainException);
    });

    it('should not throw if mission target is not starting/pre-flighting', () => {
      expect(() => MissionLogic.validateDroneStateForMissionStart(MissionStatus.COMPLETED, DroneStatus.MAINTENANCE)).not.toThrow();
      expect(() => MissionLogic.validateDroneStateForMissionStart(MissionStatus.ABORTED, DroneStatus.RETIRED)).not.toThrow();
    });

    it('should not throw if drone is not in an invalid state when starting', () => {
      expect(() => MissionLogic.validateDroneStateForMissionStart(MissionStatus.PRE_FLIGHT_CHECK, DroneStatus.AVAILABLE)).not.toThrow();
      expect(() => MissionLogic.validateDroneStateForMissionStart(MissionStatus.IN_PROGRESS, DroneStatus.AVAILABLE)).not.toThrow();
    });
  });
});
