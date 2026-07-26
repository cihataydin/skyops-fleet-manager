import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Drone } from '@/modules/drone/entities';
import { CreateDroneRequestDto, GetDronesRequestDto, UpdateDroneRequestDto } from '@/modules/drone/dtos/request';
import { DroneEvent } from '@/modules/drone/enums';
import { MAINTENANCE_INTERVAL_FLIGHT_HOURS } from '@/shared/constants';
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
import * as _ from 'lodash';

@Injectable()
export class DroneService implements IDroneService {
  public constructor(
    @InjectRepository(Drone)
    private dronesRepository: Repository<Drone>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(CACHE_TOKEN) private readonly cacheService: ICacheService,
    private readonly eventEmitter: EventEmitter2,
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
    requestDto: UpdateDroneRequestDto,
  ): Promise<UpdateDroneResponseDto> {
    const drone = await this.dronesRepository.findOne({ where: { id } });

    if (!drone) {
      throw new NotFoundException(`Drone with ID '${id}' not found`);
    }

    this.mapper.map(requestDto, UpdateDroneRequestDto, Drone);

    const filteredDto = _.omitBy(requestDto, _.isUndefined);
    Object.assign(drone, filteredDto);

    const updatedDrone = await this.dronesRepository.save(drone);

    await this.cacheService.deleteAsync(`drone_${id}`);

    if (Number(updatedDrone.totalFlightHours) > MAINTENANCE_INTERVAL_FLIGHT_HOURS) {
      const event = {
        droneId: updatedDrone.id,
        totalFlightHours: Number(updatedDrone.totalFlightHours),
      };
      this.eventEmitter.emit(DroneEvent.FLIGHT_HOURS_EXCEEDED, event);
    }

    return this.mapper.map(updatedDrone, Drone, UpdateDroneResponseDto);
  }

  public async updateMaintenanceTrackingDatesAsync(
    droneId: string,
    performedAt: Date,
  ): Promise<void> {
    const drone = await this.dronesRepository.findOne({ where: { id: droneId } });

    if (!drone) {
      throw new NotFoundException(`Drone with ID '${droneId}' not found`);
    }

    DroneLogic.updateMaintenanceTrackingDates(drone, performedAt);

    await this.dronesRepository.save(drone);

    await this.cacheService.deleteAsync(`drone_${droneId}`);
  }

  public async softDeleteDroneAsync(id: string): Promise<void>
  {
    const result = await this.dronesRepository.softDelete({ id });

    if (!result.affected) {
      throw new NotFoundException(`Drone with id ${id} not found!`);
    }

    await this.cacheService.deleteAsync(`drone_${id}`);
  }
}