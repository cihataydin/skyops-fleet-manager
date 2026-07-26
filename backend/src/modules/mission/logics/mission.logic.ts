import { Mission } from '@/modules/mission/entities';
import { MissionStatus } from '@/modules/mission/enums';
import { DomainException } from '@/shared/exceptions';

export class MissionLogic {
  private static readonly ALLOWED_TRANSITIONS: Record<MissionStatus, MissionStatus[]> = {
    [MissionStatus.PLANNED]: [MissionStatus.PRE_FLIGHT_CHECK, MissionStatus.ABORTED],
    [MissionStatus.PRE_FLIGHT_CHECK]: [MissionStatus.IN_PROGRESS, MissionStatus.ABORTED],
    [MissionStatus.IN_PROGRESS]: [MissionStatus.COMPLETED, MissionStatus.ABORTED],
    [MissionStatus.COMPLETED]: [],
    [MissionStatus.ABORTED]: [],
  };

  public static validateStatusTransition(
    currentStatus: MissionStatus,
    targetStatus: MissionStatus,
  ): void {
    if (currentStatus === targetStatus) {
      return;
    }

    const allowedNextStatuses = this.ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowedNextStatuses.includes(targetStatus)) {
      const allowedStr = allowedNextStatuses.length > 0 
        ? allowedNextStatuses.join(', ') 
        : 'none (terminal state)';

      throw new DomainException(
        `Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed transitions from '${currentStatus}': [${allowedStr}].`,
      );
    }
  }

  public static validateScheduledDates(scheduledStartTime: Date | string, scheduledEndTime: Date | string): void {
    const start = new Date(scheduledStartTime);
    const end = new Date(scheduledEndTime);

    if (start.getTime() < Date.now()) {
      throw new DomainException('Missions cannot be scheduled in the past.');
    }

    if (end.getTime() <= start.getTime()) {
      throw new DomainException('Scheduled end time must be after scheduled start time.');
    }
  }

  public static setActualStartTime(mission: Mission): void {
    if (mission.actualStartTime) {
      throw new DomainException(
        `Mission with ID '${mission.id}' already has an actual start time set.`,
      );
    }
    
    mission.actualStartTime = new Date();
  }

  public static completeMission(mission: Mission, flightHoursAtCompletion?: number): void {
    if (!flightHoursAtCompletion || Number(flightHoursAtCompletion) <= 0) {
      throw new DomainException('Completing a mission requires valid flight hours to be logged.');
    }

    mission.actualEndTime = new Date();
    mission.flightHoursAtCompletion = Number(flightHoursAtCompletion);
  }

  public static abortMission(mission: Mission, abortReason?: string): void {
    if (!abortReason || !abortReason.trim()) {
      throw new DomainException('Aborting a mission requires an abort reason.');
    }

    mission.abortReason = abortReason.trim();
  }

  public static handleStatusChange(
    mission: Mission,
    newStatus?: MissionStatus,
    flightHoursAtCompletion?: number,
    abortReason?: string,
  ): void {
    const oldStatus = mission.status;

    if (!this.isStatusChanged(oldStatus, newStatus)) {
      return;
    }

    this.validateStatusTransition(oldStatus, newStatus);

    if (newStatus === MissionStatus.IN_PROGRESS) {
      this.setActualStartTime(mission);
    } else if (newStatus === MissionStatus.COMPLETED) {
      this.completeMission(mission, flightHoursAtCompletion);
    } else if (newStatus === MissionStatus.ABORTED) {
      this.abortMission(mission, abortReason);
    }
  }

  public static isStatusChanged(status: MissionStatus, newStatus?: MissionStatus): boolean {
    return Boolean(status && newStatus && newStatus !== status);
  }

  public static isMissionStarted(status: MissionStatus, newStatus?: MissionStatus): boolean {
    return this.isStatusChanged(status, newStatus) && newStatus === MissionStatus.IN_PROGRESS;
  }

  public static isMissionCompleted(status: MissionStatus, newStatus?: MissionStatus): boolean {
    return this.isStatusChanged(status, newStatus) && newStatus === MissionStatus.COMPLETED;
  }

  public static isMissionAborted(status: MissionStatus, newStatus?: MissionStatus): boolean {
    return this.isStatusChanged(status, newStatus) && newStatus === MissionStatus.ABORTED;
  }
}
