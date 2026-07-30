import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Drone } from '@/modules/drone/entities';
import { DroneStatus, DroneEvent } from '@/modules/drone/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LOGGER_TOKEN } from '@/shared/di';
import { ILoggerService } from '@/infra/logger';

@Injectable()
export class DroneScheduleService {
  public constructor(
    @InjectRepository(Drone)
    private readonly dronesRepository: Repository<Drone>,
    private readonly eventEmitter: EventEmitter2,
    @Inject(LOGGER_TOKEN) private readonly loggerService: ILoggerService,
  ) {
    this.loggerService.setContext(DroneScheduleService.name);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async checkMaintenanceDueDatesAsync(): Promise<void> {
    this.loggerService.log(
      'Running daily cron job to check drone maintenance due dates...',
    );

    const dueDrones = await this.dronesRepository.find({
      where: {
        status: DroneStatus.AVAILABLE,
        nextMaintenanceDueDate: LessThanOrEqual(new Date()),
      },
    });

    if (dueDrones.length === 0) {
      this.loggerService.log(
        'No drones due for 90-day calendar maintenance today.',
      );
      return;
    }

    this.loggerService.log(
      `Found ${dueDrones.length} drone(s) due for 90-day calendar maintenance.`,
    );

    for (const drone of dueDrones) {
      this.eventEmitter.emit(DroneEvent.MAINTENANCE_DUE, {
        droneId: drone.id,
        totalFlightHours: Number(drone.totalFlightHours || 0),
        reason: 'CALENDAR_90_DAYS',
        nextMaintenanceDueDate: drone.nextMaintenanceDueDate,
      });
    }
  }
}
