import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DroneEvent } from '@/modules/drone/enums';
import { DroneFlightHoursExceededEvent, DroneMaintenanceDueEvent } from '@/modules/drone/events';
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
    const notes = `Auto-generated maintenance log: total flight hours reached ${totalFlightHours}h (exceeded threshold 50h).`;

    await this.processRoutineMaintenanceLogAsync(
      droneId,
      totalFlightHours,
      'System Auto Trigger (50h Exceeded)',
      notes,
    );
  }

  @OnEvent(DroneEvent.MAINTENANCE_DUE, { async: true })
  public async handleDroneMaintenanceDueEvent(
    event: DroneMaintenanceDueEvent,
  ): Promise<void> {
    const { droneId, totalFlightHours, reason, nextMaintenanceDueDate } = event;
    const notes = `Auto-generated routine maintenance log: 90-day calendar interval reached (due: ${nextMaintenanceDueDate ? new Date(nextMaintenanceDueDate).toISOString() : 'now'}).`;

    await this.processRoutineMaintenanceLogAsync(
      droneId,
      totalFlightHours,
      `System Scheduled Trigger (${reason})`,
      notes,
    );
  }

  private async processRoutineMaintenanceLogAsync(
    droneId: string,
    flightHours: number,
    technicianName: string,
    notes: string,
  ): Promise<void> {
    this.loggerService.log(`Processing automatic routine maintenance log for drone '${droneId}' (${technicianName}).`);

    await this.maintenanceService.createMaintenanceLogAsync({
      droneId,
      type: MaintenanceType.ROUTINE_CHECK,
      technicianName,
      notes,
      performedAt: new Date(),
      flightHoursAtMaintenance: flightHours,
    });

    this.loggerService.log(`Automatic maintenance log successfully created for drone '${droneId}'.`);
  }
}
