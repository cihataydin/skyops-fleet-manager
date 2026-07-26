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

  public static setActualStartTime(mission: Mission): void {
    if (mission.actualStartTime) {
      throw new DomainException(
        `Mission with ID '${mission.id}' already has an actual start time set.`,
      );
    }
    
    mission.actualStartTime = new Date();
  }

  public static isStatusChanged(status: MissionStatus, newStatus: MissionStatus): boolean {
    return status && newStatus && newStatus !== status;
  }

  public static isMissionStarted(status: MissionStatus, newStatus: MissionStatus): boolean {
    return this.isStatusChanged(status, newStatus) && newStatus === MissionStatus.IN_PROGRESS;
  }
}
