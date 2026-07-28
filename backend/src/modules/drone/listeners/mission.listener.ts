import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MissionEvent } from '@/modules/mission/enums';
import { MissionStartedEvent, MissionCompletedEvent, MissionAbortedEvent } from '@/modules/mission/events';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { IDroneService } from '@/modules/drone/interfaces';
import { DroneStatus } from '@/modules/drone/enums';
import { LOGGER_TOKEN } from '@/shared/di';
import { ILoggerService } from '@/infra/logger';

@Injectable()
export class MissionListener {
  constructor(
    @Inject(DRONE_SERVICE_TOKEN)
    private readonly droneService: IDroneService,
    @Inject(LOGGER_TOKEN) private readonly loggerService: ILoggerService,
  ) {
    this.loggerService.setContext(MissionListener.name);
  }

  @OnEvent(MissionEvent.MISSION_STARTED, { async: true })
  public async handleMissionStartedEvent(event: MissionStartedEvent): Promise<void> {
    const { droneId, missionId } = event;

    this.loggerService.log(
      `Received '${MissionEvent.MISSION_STARTED}' event for mission '${missionId}' (Drone '${droneId}').`,
    );

    await this.droneService.updateDroneAsync(droneId, { status: DroneStatus.IN_MISSION });

    this.loggerService.log(
      `Drone '${droneId}' status updated to '${DroneStatus.IN_MISSION}'`,
    );
  }

  @OnEvent(MissionEvent.MISSION_COMPLETED, { async: true })
  public async handleMissionCompletedEvent(event: MissionCompletedEvent): Promise<void> {
    const { droneId, missionId, flightHours } = event;

    this.loggerService.log(
      `Received '${MissionEvent.MISSION_COMPLETED}' event for mission '${missionId}' (Drone '${droneId}', ${flightHours}h logged).`,
    );

    await this.processMissionEndAsync(droneId, flightHours);
  }

  @OnEvent(MissionEvent.MISSION_ABORTED, { async: true })
  public async handleMissionAbortedEvent(event: MissionAbortedEvent): Promise<void> {
    const { droneId, missionId, abortReason, flightHoursAtAborting } = event;

    this.loggerService.log(
      `Received '${MissionEvent.MISSION_ABORTED}' event for mission '${missionId}' (Drone '${droneId}'). Reason: ${abortReason || 'None'}`,
    );

    await this.processMissionEndAsync(droneId, flightHoursAtAborting);
  }

  private async processMissionEndAsync(droneId: string, addedFlightHours: number = 0): Promise<void> {
    await this.droneService.recordFlightHoursAsync(droneId, addedFlightHours);   

    await this.droneService.updateDroneAsync(droneId, {
      status: DroneStatus.AVAILABLE,
    });

    this.loggerService.log(
      `Drone '${droneId}' updated with ${addedFlightHours}h flight hours and status set to '${DroneStatus.AVAILABLE}'.`,
    );
  }
}
