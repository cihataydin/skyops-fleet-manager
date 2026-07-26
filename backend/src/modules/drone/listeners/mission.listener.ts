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
    const { droneId, missionId, flightHoursLogged } = event;

    this.loggerService.log(
      `Received '${MissionEvent.MISSION_COMPLETED}' event for mission '${missionId}' (Drone '${droneId}', ${flightHoursLogged}h logged).`,
    );

    const drone = await this.droneService.getDroneAsync(droneId);

    if (drone) {
      const newTotalFlightHours = Number(drone.totalFlightHours || 0) + Number(flightHoursLogged);

      await this.droneService.updateDroneAsync(droneId, {
        totalFlightHours: newTotalFlightHours,
        status: DroneStatus.AVAILABLE,
      });

      this.loggerService.log(
        `Drone '${droneId}' updated with total flight hours ${newTotalFlightHours}h and status set to '${DroneStatus.AVAILABLE}'.`,
      );
    }
  }

  @OnEvent(MissionEvent.MISSION_ABORTED, { async: true })
  public async handleMissionAbortedEvent(event: MissionAbortedEvent): Promise<void> {
    const { droneId, missionId, abortReason } = event;

    this.loggerService.log(
      `Received '${MissionEvent.MISSION_ABORTED}' event for mission '${missionId}' (Drone '${droneId}'). Reason: ${abortReason || 'None'}`,
    );

    await this.droneService.updateDroneAsync(droneId, { status: DroneStatus.AVAILABLE });

    this.loggerService.log(
      `Drone '${droneId}' status updated to '${DroneStatus.AVAILABLE}' following mission abort.`,
    );
  }
}
