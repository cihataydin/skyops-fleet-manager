import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DroneEvent } from '@/modules/drone/enums';
import { DroneFlightHoursExceededEvent } from '@/modules/drone/events';
import { MAINTENANCE_SERVICE_TOKEN } from '@/modules/maintenance/di';
import { IMaintenanceService } from '@/modules/maintenance/interfaces';
import { MaintenanceType } from '@/modules/maintenance/enums';
import { LOGGER_TOKEN } from '@/shared/di';
import { ILoggerService } from '@/infra/logger';

@Injectable()
export class DroneMaintenanceListener {
  constructor(
    @Inject(MAINTENANCE_SERVICE_TOKEN)
    private readonly maintenanceService: IMaintenanceService,
    @Inject(LOGGER_TOKEN) private readonly loggerService: ILoggerService,
  ) {
    this.loggerService.setContext(DroneMaintenanceListener.name);
  }

  @OnEvent(DroneEvent.FLIGHT_HOURS_EXCEEDED, { async: true })
  public async handleDroneFlightHoursExceededEvent(
    event: DroneFlightHoursExceededEvent,
  ): Promise<void> {
    const { droneId, totalFlightHours } = event;

    this.loggerService.log(
      `Received '${DroneEvent.FLIGHT_HOURS_EXCEEDED}' event for drone '${droneId}' (${totalFlightHours} flight hours).`,
    );

    await this.maintenanceService.createMaintenanceLogAsync({
        droneId,
        type: MaintenanceType.ROUTINE_CHECK,
        technicianName: 'System Auto Trigger',
        notes: `Auto-generated maintenance log: total flight hours reached ${totalFlightHours}h (exceeded threshold 50h).`,
        performedAt: new Date(),
        flightHoursAtMaintenance: totalFlightHours,
      });

    this.loggerService.log(`Automatic maintenance log created for drone '${droneId}'.`);
  }
}
