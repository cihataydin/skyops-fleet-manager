import { Mission } from '@/modules/mission/entities';
import { MissionStatus } from '@/modules/mission/enums';
import { DroneStatus } from '@/modules/drone/enums';
import { DomainException } from '@/shared/exceptions';
import { MS_PER_HOUR } from '@/shared/constants';

export class MissionLogic {
  private static readonly ALLOWED_TRANSITIONS: Record<MissionStatus, MissionStatus[]> = {
    [MissionStatus.PLANNED]: [MissionStatus.PRE_FLIGHT_CHECK, MissionStatus.ABORTED],
    [MissionStatus.PRE_FLIGHT_CHECK]: [MissionStatus.IN_PROGRESS, MissionStatus.ABORTED],
    [MissionStatus.IN_PROGRESS]: [MissionStatus.COMPLETED, MissionStatus.ABORTED],
    [MissionStatus.COMPLETED]: [],
    [MissionStatus.ABORTED]: [],
  };

  public static validateDroneAvailability(droneStatus: DroneStatus | string, droneId: string): void {
    if (droneStatus !== DroneStatus.AVAILABLE) {
      throw new DomainException(
        `Drone '${droneId}' cannot be assigned to a mission because its current status is '${droneStatus}'. Only drones with 'AVAILABLE' status can be assigned.`,
      );
    }
  }

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

  public static startMission(mission: Mission): void {
    if (mission.actualStartTime) {
      throw new DomainException(
        `Mission with ID '${mission.id}' already has an actual start time set.`,
      );
    }
    
    mission.actualStartTime = new Date();
    mission.status = MissionStatus.IN_PROGRESS
  }

  public static completeMission(mission: Mission, flightHoursAtCompletion?: number): void {
    if (!flightHoursAtCompletion || Number(flightHoursAtCompletion) <= 0) {
      throw new DomainException('Completing a mission requires valid flight hours to be logged.');
    }

    mission.actualEndTime = new Date();
    mission.flightHoursAtCompletion = Number(flightHoursAtCompletion);
    mission.status = MissionStatus.COMPLETED;
  }

  public static abortMission(mission: Mission, abortReason?: string): void {
    if (!abortReason || !abortReason.trim()) {
      throw new DomainException('Aborting a mission requires an abort reason.');
    }

    mission.actualEndTime = new Date();
    mission.abortReason = abortReason.trim();
    mission.status = MissionStatus.ABORTED;
  }

  public static preFlightCheckMission(mission: Mission)
  {
    mission.status = MissionStatus.PRE_FLIGHT_CHECK;
  }

  public static handleStatusChange(
    mission: Mission,
    newStatus?: MissionStatus,
    flightHoursAtCompletion?: number,
    abortReason?: string,
  ): void {
    const { status: oldStatus } = mission;

    if (!this.isStatusChanged(oldStatus, newStatus)) {
      throw new DomainException(
        `Mission with ID '${mission.id}' is already in status '${oldStatus}'. No status change detected.`,
      );
    }

    this.validateStatusTransition(oldStatus, newStatus);

    if (newStatus === MissionStatus.IN_PROGRESS) {
      this.startMission(mission);
    } else if (newStatus === MissionStatus.COMPLETED) {
      this.completeMission(mission, flightHoursAtCompletion);
    } else if (newStatus === MissionStatus.ABORTED) {
      this.abortMission(mission, abortReason);
    } else if (newStatus === MissionStatus.PRE_FLIGHT_CHECK) {
      this.preFlightCheckMission(mission);
    }
  }

  public static isStatusChanged(status: MissionStatus, newStatus?: MissionStatus): boolean {
    return Boolean(status && newStatus && newStatus !== status);
  }

  public static calculateFutureDate(hoursToAdd: number): Date {
    const now = new Date();
    return new Date(now.getTime() + hoursToAdd * MS_PER_HOUR);
  }
}
