import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MaintenanceEvent } from '@/modules/maintenance/enums';
import { MaintenanceCreatedEvent } from '@/modules/maintenance/events';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { IDroneService } from '@/modules/drone/interfaces';
import { LOGGER_TOKEN } from '@/shared/di';
import { ILoggerService } from '@/infra/logger';

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
    const { droneId, performedAt } = event;

    this.loggerService.log(
      `Received '${MaintenanceEvent.MAINTENANCE_CREATED}' event for drone '${droneId}'.`,
    );

    await this.droneService.updateMaintenanceTrackingDatesAsync(droneId, performedAt);

    this.loggerService.log(
      `Drone '${droneId}' maintenance tracking dates updated successfully.`,
    );
  }
}
