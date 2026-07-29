import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DroneEvent, DroneStatus } from '@/modules/drone/enums';
import {
  DroneFlightHoursExceededEvent,
  DroneMaintenanceDueEvent,
} from '@/modules/drone/events';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { IDroneService } from '@/modules/drone/interfaces';
import { LOGGER_TOKEN } from '@/shared/di';
import { ILoggerService } from '@/infra/logger';

@Injectable()
export class DroneMaintenanceListener {
  constructor(
    @Inject(DRONE_SERVICE_TOKEN)
    private readonly droneService: IDroneService,
    @Inject(LOGGER_TOKEN) private readonly loggerService: ILoggerService,
  ) {
    this.loggerService.setContext(DroneMaintenanceListener.name);
  }

  @OnEvent(DroneEvent.FLIGHT_HOURS_EXCEEDED, { async: true })
  public async handleDroneFlightHoursExceededEvent(
    event: DroneFlightHoursExceededEvent,
  ): Promise<void> {
    try {
      const { droneId, totalFlightHours } = event;
      this.loggerService.log(
        `Drone '${droneId}' exceeded flight hours (${totalFlightHours}h). Putting to maintenance.`,
      );
      await this.droneService.updateDroneAsync(droneId, {
        status: DroneStatus.MAINTENANCE,
      });
    } catch (error) {
      this.loggerService.error(
        `Failed to handle FLIGHT_HOURS_EXCEEDED for drone '${event.droneId}'`,
        undefined,
        (error as Error).stack,
      );
    }
  }

  @OnEvent(DroneEvent.MAINTENANCE_DUE, { async: true })
  public async handleDroneMaintenanceDueEvent(
    event: DroneMaintenanceDueEvent,
  ): Promise<void> {
    try {
      const { droneId, reason } = event;
      this.loggerService.log(
        `Drone '${droneId}' is due for maintenance (${reason}). Putting to maintenance.`,
      );
      await this.droneService.updateDroneAsync(droneId, {
        status: DroneStatus.MAINTENANCE,
      });
    } catch (error) {
      this.loggerService.error(
        `Failed to handle MAINTENANCE_DUE for drone '${event.droneId}'`,
        undefined,
        (error as Error).stack,
      );
    }
  }
}
