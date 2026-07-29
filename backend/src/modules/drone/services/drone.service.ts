import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Drone } from '@/modules/drone/entities';
import {
  CreateDroneRequestDto,
  GetDronesRequestDto,
} from '@/modules/drone/dtos/request';
import { DroneEvent, DroneStatus } from '@/modules/drone/enums';
import { DroneLogic } from '../logics';
import { CACHE_TOKEN } from '@/shared/di';
import { ICacheService } from '@/infra/cache';
import { PaginationUtil } from '@/shared/utils';
import {
  GetDronesResponseDto,
  GetDroneResponseDto,
  CreateDroneResponseDto,
  UpdateDroneResponseDto,
} from '@/modules/drone/dtos/response';
import { IDroneService } from '@/modules/drone/interfaces';
import { MISSION_SERVICE_TOKEN } from '@/modules/mission/di';
import { IMissionService } from '@/modules/mission/interfaces';
import * as _ from 'lodash';

import { MS_PER_DAY } from '@/shared/constants';
import { DroneFlightHoursExceededEvent } from '@/modules/drone/events';
import { UpdateDroneRequestModel } from '@/modules/drone/models/request';

@Injectable()
export class DroneService implements IDroneService {
  public constructor(
    @InjectRepository(Drone)
    private dronesRepository: Repository<Drone>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(CACHE_TOKEN) private readonly cacheService: ICacheService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => MISSION_SERVICE_TOKEN))
    private readonly missionService: IMissionService,
  ) {}

  public async getDronesAsync(
    requestDto: GetDronesRequestDto,
  ): Promise<GetDronesResponseDto> {
    const { limit, page, direction, orderBy, model, status } = requestDto;
    const where = {
      ...(model ? { model } : {}),
      ...(status ? { status } : {}),
    };
    const [droneEntities, count] = await this.dronesRepository.findAndCount({
      where,
      skip: PaginationUtil.calculateSkip(page, limit),
      take: limit,
      order: {
        [orderBy]: direction,
        id: 'asc',
      },
    });
    const droneDtos = this.mapper.mapArray(
      droneEntities,
      Drone,
      GetDroneResponseDto,
    );

    return new GetDronesResponseDto(droneDtos, { count, page });
  }

  public async getDroneAsync(id: string): Promise<GetDroneResponseDto> {
    const droneCache = await this.cacheService.getAsync<Drone>(`drone_${id}`);

    if (droneCache) {
      return this.mapper.map(droneCache, Drone, GetDroneResponseDto);
    }
    const drone = await this.dronesRepository.findOne({ where: { id } });

    if (!drone) {
      throw new NotFoundException(`Drone with ID '${id}' not found`);
    }

    await this.cacheService.setAsync(`drone_${id}`, JSON.stringify(drone));

    return this.mapper.map(drone, Drone, GetDroneResponseDto);
  }

  public async createDroneAsync(
    requestDto: CreateDroneRequestDto,
  ): Promise<CreateDroneResponseDto> {
    const drone = this.mapper.map(requestDto, CreateDroneRequestDto, Drone);
    const createdDrone = this.dronesRepository.create(drone);

    await this.dronesRepository.save(createdDrone);

    return this.mapper.map(createdDrone, Drone, CreateDroneResponseDto);
  }

  public async updateDroneAsync(
    id: string,
    requestModel: UpdateDroneRequestModel,
  ): Promise<UpdateDroneResponseDto> {
    const drone = await this.dronesRepository.findOne({ where: { id } });

    if (!drone) {
      throw new NotFoundException(`Drone with ID '${id}' not found`);
    }

    const { status } = requestModel;
    const hasUpcomingMission =
      status === DroneStatus.RETIRED
        ? await this.missionService.hasUpcomingMissionAsync(id)
        : false;

    DroneLogic.validateManualStatusUpdate(
      drone.status,
      status,
      hasUpcomingMission,
      id,
    );

    const filteredDto = _.omitBy(requestModel, _.isUndefined);
    Object.assign(drone, filteredDto);

    const updatedDrone = await this.dronesRepository.save(drone);

    await this.cacheService.deleteAsync(`drone_${id}`);

    return this.mapper.map(updatedDrone, Drone, UpdateDroneResponseDto);
  }

  public async recordFlightHoursAsync(
    droneId: string,
    addedHours: number,
  ): Promise<void> {
    if (addedHours <= 0) return;

    const result = await this.dronesRepository
      .createQueryBuilder()
      .update(Drone)
      .set({
        totalFlightHours: () => `"total_flight_hours" + ${addedHours}`,
      })
      .where('id = :id', { id: droneId })
      .returning('*')
      .execute();

    await this.cacheService.deleteAsync(`drone_${droneId}`);

    const rawDrone = result.raw[0];
    if (
      rawDrone &&
      DroneLogic.isFlightHoursExceeded(
        Number(rawDrone.total_flight_hours),
        Number(rawDrone.flight_hours_at_last_maintenance),
      )
    ) {
      this.eventEmitter.emit(DroneEvent.FLIGHT_HOURS_EXCEEDED, {
        droneId: rawDrone.id,
        totalFlightHours: Number(rawDrone.total_flight_hours),
      } as DroneFlightHoursExceededEvent);
    }
  }

  public async updateMaintenanceTrackingDatesAsync(
    droneId: string,
    performedAt: Date,
  ): Promise<void> {
    const drone = await this.dronesRepository.findOne({
      where: { id: droneId },
    });

    if (!drone) {
      throw new NotFoundException(`Drone with ID '${droneId}' not found`);
    }

    DroneLogic.updateMaintenanceTrackingDates(drone, performedAt);

    await this.dronesRepository.save(drone);

    await this.cacheService.deleteAsync(`drone_${droneId}`);
  }

  public async getDroneStatusBreakdownAsync(): Promise<{
    total: number;
    breakdown: Record<string, number>;
  }> {
    const drones = await this.dronesRepository.find();
    const breakdown = DroneLogic.calculateStatusBreakdown(drones);
    return { total: drones.length, breakdown };
  }

  public async getMaintenanceAlertDronesAsync(
    daysThreshold: number,
  ): Promise<GetDroneResponseDto[]> {
    const alertThreshold = new Date(Date.now() + daysThreshold * MS_PER_DAY);
    const overdueDrones = await this.dronesRepository.find({
      where: {
        nextMaintenanceDueDate: LessThan(alertThreshold),
      },
    });
    return this.mapper.mapArray(overdueDrones, Drone, GetDroneResponseDto);
  }

  public async getAverageFlightHoursAsync(): Promise<number> {
    const drones = await this.dronesRepository.find();
    return DroneLogic.calculateAverageFlightHours(drones);
  }

  public async softDeleteDroneAsync(id: string): Promise<void> {
    const result = await this.dronesRepository.softDelete({ id });

    if (!result.affected) {
      throw new NotFoundException(`Drone with id ${id} not found!`);
    }

    await this.cacheService.deleteAsync(`drone_${id}`);
  }
}
