import { MissionLogic } from '@/modules/mission/logics/mission.logic';
import { Mission } from '@/modules/mission/entities';
import { MissionStatus } from '@/modules/mission/enums';
import { DomainException } from '@/shared/exceptions';

describe('MissionLogic', () => {
  describe('validateStatusTransition', () => {
    it('should allow transition from PLANNED to PRE_FLIGHT_CHECK', () => {
      expect(() =>
        MissionLogic.validateStatusTransition(
          MissionStatus.PLANNED,
          MissionStatus.PRE_FLIGHT_CHECK,
        ),
      ).not.toThrow();
    });

    it('should allow transition from PLANNED to ABORTED', () => {
      expect(() =>
        MissionLogic.validateStatusTransition(
          MissionStatus.PLANNED,
          MissionStatus.ABORTED,
        ),
      ).not.toThrow();
    });

    it('should throw DomainException for invalid transition from PLANNED to COMPLETED', () => {
      expect(() =>
        MissionLogic.validateStatusTransition(
          MissionStatus.PLANNED,
          MissionStatus.COMPLETED,
        ),
      ).toThrow(DomainException);
    });

    it('should allow transition from PRE_FLIGHT_CHECK to IN_PROGRESS', () => {
      expect(() =>
        MissionLogic.validateStatusTransition(
          MissionStatus.PRE_FLIGHT_CHECK,
          MissionStatus.IN_PROGRESS,
        ),
      ).not.toThrow();
    });

    it('should allow transition from PRE_FLIGHT_CHECK to ABORTED', () => {
      expect(() =>
        MissionLogic.validateStatusTransition(
          MissionStatus.PRE_FLIGHT_CHECK,
          MissionStatus.ABORTED,
        ),
      ).not.toThrow();
    });

    it('should throw DomainException for invalid transition from PRE_FLIGHT_CHECK to COMPLETED', () => {
      expect(() =>
        MissionLogic.validateStatusTransition(
          MissionStatus.PRE_FLIGHT_CHECK,
          MissionStatus.COMPLETED,
        ),
      ).toThrow(DomainException);
    });

    it('should allow transition from IN_PROGRESS to ABORTED', () => {
      expect(() =>
        MissionLogic.validateStatusTransition(
          MissionStatus.IN_PROGRESS,
          MissionStatus.ABORTED,
        ),
      ).not.toThrow();
    });

    it('should allow transition from IN_PROGRESS to COMPLETED', () => {
      expect(() =>
        MissionLogic.validateStatusTransition(
          MissionStatus.IN_PROGRESS,
          MissionStatus.COMPLETED,
        ),
      ).not.toThrow();
    });

    it('should throw DomainException for transition from terminal state COMPLETED', () => {
      expect(() =>
        MissionLogic.validateStatusTransition(
          MissionStatus.COMPLETED,
          MissionStatus.IN_PROGRESS,
        ),
      ).toThrow(DomainException);
    });

    it('should throw DomainException for transition from terminal state ABORTED', () => {
      expect(() =>
        MissionLogic.validateStatusTransition(
          MissionStatus.ABORTED,
          MissionStatus.PRE_FLIGHT_CHECK,
        ),
      ).toThrow(DomainException);
    });
  });

  describe('handleStatusChange', () => {
    let mission: Mission;

    beforeEach(() => {
      mission = new Mission();
      mission.id = 'mission-1';
      mission.status = MissionStatus.PLANNED;
    });

    it('should start mission and set actualStartTime', () => {
      mission.status = MissionStatus.PRE_FLIGHT_CHECK;
      MissionLogic.handleStatusChange(mission, MissionStatus.IN_PROGRESS);
      expect(mission.status).toBe(MissionStatus.IN_PROGRESS);
      expect(mission.actualStartTime).toBeInstanceOf(Date);
    });

    it('should throw if starting a mission that already has actualStartTime', () => {
      mission.status = MissionStatus.PRE_FLIGHT_CHECK;
      mission.actualStartTime = new Date();
      expect(() =>
        MissionLogic.handleStatusChange(mission, MissionStatus.IN_PROGRESS),
      ).toThrow(DomainException);
    });

    it('should complete mission and require flight hours', () => {
      mission.status = MissionStatus.IN_PROGRESS;
      expect(() =>
        MissionLogic.handleStatusChange(mission, MissionStatus.COMPLETED),
      ).toThrow(DomainException);
      MissionLogic.handleStatusChange(mission, MissionStatus.COMPLETED, 5);
      expect(mission.status).toBe(MissionStatus.COMPLETED);
      expect(mission.actualEndTime).toBeInstanceOf(Date);
      expect(mission.flightHoursAtCompletion).toBe(5);
    });

    it('should abort mission and require abort reason', () => {
      mission.status = MissionStatus.IN_PROGRESS;
      expect(() =>
        MissionLogic.handleStatusChange(mission, MissionStatus.ABORTED),
      ).toThrow(DomainException);
      MissionLogic.handleStatusChange(
        mission,
        MissionStatus.ABORTED,
        undefined,
        'Weather conditions',
      );
      expect(mission.status).toBe(MissionStatus.ABORTED);
      expect(mission.actualEndTime).toBeInstanceOf(Date);
      expect(mission.abortReason).toBe('Weather conditions');
    });
  });
});
