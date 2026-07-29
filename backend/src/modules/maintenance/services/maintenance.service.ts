import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DroneStatus } from '@/modules/drone/enums';
import { Repository } from 'typeorm';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { MaintenanceLog } from '@/modules/maintenance/entities';
import {
  CreateMaintenanceLogRequestDto,
  GetMaintenanceLogsRequestDto,
} from '@/modules/maintenance/dtos/request';
import { CACHE_TOKEN } from '@/shared/di';
import { ICacheService } from '@/infra/cache';
import { PaginationUtil } from '@/shared/utils';
import {
  GetMaintenanceLogsResponseDto,
  GetMaintenanceLogResponseDto,
  CreateMaintenanceLogResponseDto,
} from '@/modules/maintenance/dtos/response';
import { IMaintenanceService } from '@/modules/maintenance/interfaces';
import * as _ from 'lodash';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { IDroneService } from '@/modules/drone/interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MaintenanceEvent } from '@/modules/maintenance/enums';
import { MaintenanceLogic } from '@/modules/maintenance/logics';
import { MaintenanceCreatedEvent } from '@/modules/maintenance/events';

@Injectable()
export class MaintenanceService implements IMaintenanceService {
  public constructor(
    @InjectRepository(MaintenanceLog)
    private maintenanceLogsRepository: Repository<MaintenanceLog>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(CACHE_TOKEN) private readonly cacheService: ICacheService,
    @Inject(DRONE_SERVICE_TOKEN) private readonly droneService: IDroneService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async getMaintenanceLogsAsync(
    requestDto: GetMaintenanceLogsRequestDto,
  ): Promise<GetMaintenanceLogsResponseDto> {
    const { limit, page, direction, orderBy, droneId, type } = requestDto;
    const where = {
      ...(droneId ? { droneId } : {}),
      ...(type ? { type } : {}),
    };
    const [logEntities, count] =
      await this.maintenanceLogsRepository.findAndCount({
        where,
        skip: PaginationUtil.calculateSkip(page, limit),
        take: limit,
        order: {
          [orderBy]: direction,
          id: 'asc',
        },
      });
    const logDtos = this.mapper.mapArray(
      logEntities,
      MaintenanceLog,
      GetMaintenanceLogResponseDto,
    );

    return new GetMaintenanceLogsResponseDto(logDtos, { count, page });
  }

  public async getMaintenanceLogAsync(
    id: string,
  ): Promise<GetMaintenanceLogResponseDto> {
    const logCache = await this.cacheService.getAsync<MaintenanceLog>(
      `maintenance_${id}`,
    );

    if (logCache) {
      return this.mapper.map(
        logCache,
        MaintenanceLog,
        GetMaintenanceLogResponseDto,
      );
    }
    const log = await this.maintenanceLogsRepository.findOne({ where: { id } });

    if (!log) {
      throw new NotFoundException(`Maintenance log with ID '${id}' not found`);
    }

    await this.cacheService.setAsync(`maintenance_${id}`, JSON.stringify(log));

    return this.mapper.map(log, MaintenanceLog, GetMaintenanceLogResponseDto);
  }

  public async createMaintenanceLogAsync(
    requestDto: CreateMaintenanceLogRequestDto,
  ): Promise<CreateMaintenanceLogResponseDto> {
    const { droneId, flightHoursAtMaintenance } = requestDto;
    const drone = await this.droneService.getDroneAsync(droneId);

    if (!drone) {
      throw new NotFoundException(`Drone with ID '${droneId}' not found`);
    }

    if (drone.status !== DroneStatus.MAINTENANCE) {
      throw new BadRequestException(
        `Drone with ID '${droneId}' must be in MAINTENANCE status to create a maintenance log. Send it to maintenance first.`,
      );
    }

    const { totalFlightHours } = drone;

    MaintenanceLogic.validateFlightHoursAtMaintenance(
      flightHoursAtMaintenance,
      totalFlightHours,
    );

    const log = this.mapper.map(
      requestDto,
      CreateMaintenanceLogRequestDto,
      MaintenanceLog,
    );
    const createdLog = this.maintenanceLogsRepository.create(log);

    await this.maintenanceLogsRepository.save(createdLog);

    const { performedAt, droneId: createdLogDroneId } = createdLog;

    this.eventEmitter.emit(MaintenanceEvent.MAINTENANCE_CREATED, {
      droneId: createdLogDroneId,
      performedAt,
      flightHoursAtMaintenance,
    } as MaintenanceCreatedEvent);

    return this.mapper.map(
      createdLog,
      MaintenanceLog,
      CreateMaintenanceLogResponseDto,
    );
  }
}
