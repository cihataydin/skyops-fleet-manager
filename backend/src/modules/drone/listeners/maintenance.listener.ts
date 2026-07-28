import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MaintenanceEvent } from '@/modules/maintenance/enums';
import { MaintenanceCreatedEvent } from '@/modules/maintenance/events';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { IDroneService } from '@/modules/drone/interfaces';
import { LOGGER_TOKEN } from '@/shared/di';
import { ILoggerService } from '@/infra/logger';
import { DroneStatus } from '@/modules/drone/enums';

@Injectable()
export class MaintenanceListener {
  constructor(
    @Inject(DRONE_SERVICE_TOKEN)
    private readonly droneService: IDroneService,
    @Inject(LOGGER_TOKEN) private readonly loggerService: ILoggerService,
  ) {
    this.loggerService.setContext(MaintenanceListener.name);
  }

  @OnEvent(MaintenanceEvent.MAINTENANCE_CREATED, { async: true })
  public async handleMaintenanceCreatedEvent(
    event: MaintenanceCreatedEvent,
  ): Promise<void> {
    try {
      const { droneId, performedAt, flightHoursAtMaintenance } = event;

      this.loggerService.log(
        `Received '${MaintenanceEvent.MAINTENANCE_CREATED}' event for drone '${droneId}'.`,
      );

      // TODO: should we merge this two service methods?
      await this.droneService.updateDroneAsync(droneId, { status: DroneStatus.AVAILABLE, flightHoursAtLastMaintenance: flightHoursAtMaintenance});
      await this.droneService.updateMaintenanceTrackingDatesAsync(droneId, performedAt);

      this.loggerService.log(
        `Drone '${droneId}' maintenance tracking dates updated and status set to AVAILABLE.`,
      );
    } catch (error) {
      this.loggerService.error(`Failed to handle MAINTENANCE_CREATED for drone '${event.droneId}'`, undefined, (error as Error).stack);
    }
  }
}
