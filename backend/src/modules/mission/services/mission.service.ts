import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, LessThan, MoreThan, In, Between, LessThanOrEqual, MoreThanOrEqual, FindOptionsWhere } from 'typeorm';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Mission } from '@/modules/mission/entities';
import { CreateMissionRequestDto, GetMissionsRequestDto, UpdateMissionRequestDto, CompleteMissionRequestDto, AbortMissionRequestDto } from '@/modules/mission/dtos/request';
import { CACHE_TOKEN } from '@/shared/di';
import { ICacheService } from '@/infra/cache';
import { PaginationUtil } from '@/shared/utils';
import { DomainException } from '@/shared/exceptions';
import {
  GetMissionsResponseDto,
  GetMissionResponseDto,
  CreateMissionResponseDto,
  UpdateMissionResponseDto,
} from '@/modules/mission/dtos/response';
import { IMissionService } from '@/modules/mission/interfaces';
import * as _ from 'lodash';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MissionEvent, MissionStatus } from '@/modules/mission/enums';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { IDroneService } from '@/modules/drone/interfaces';
import { MissionLogic } from '@/modules/mission/logics';
import { MissionAbortedEvent, MissionCompletedEvent, MissionStartedEvent } from '@/modules/mission/events';

@Injectable()
export class MissionService implements IMissionService {
  public constructor(
    @InjectRepository(Mission)
    private missionsRepository: Repository<Mission>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(CACHE_TOKEN) private readonly cacheService: ICacheService,
    @Inject(forwardRef(() => DRONE_SERVICE_TOKEN)) private readonly droneService: IDroneService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async getMissionsAsync(
    requestDto: GetMissionsRequestDto,
  ): Promise<GetMissionsResponseDto> {
    const { limit, page, direction, orderBy, name, type, status, droneId, pilotName, startDate, endDate } = requestDto;
    const where: FindOptionsWhere<Mission> = {
      ...(name ? { name } : {}),
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(droneId ? { droneId } : {}),
      ...(pilotName ? { pilotName } : {}),
    };

    if (startDate && endDate) {
      where.scheduledStartTime = Between(startDate, endDate);
    } else if (startDate) {
      where.scheduledStartTime = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.scheduledStartTime = LessThanOrEqual(endDate);
    }
    const [missionEntities, count] = await this.missionsRepository.findAndCount({
      where,
      skip: PaginationUtil.calculateSkip(page, limit),
      take: limit,
      order: {
        [orderBy]: direction,
        id: 'asc',
      },
    });
    const missionDtos = this.mapper.mapArray(
      missionEntities,
      Mission,
      GetMissionResponseDto,
    );

    return new GetMissionsResponseDto(missionDtos, { count, page });
  }

  public async getMissionAsync(id: string): Promise<GetMissionResponseDto> {
    const missionCache = await this.cacheService.getAsync<Mission>(`mission_${id}`);

    if (missionCache) {
      return this.mapper.map(missionCache, Mission, GetMissionResponseDto);
    }
    const mission = await this.missionsRepository.findOne({ where: { id } });

    if (!mission) {
      throw new NotFoundException(`Mission with ID '${id}' not found`);
    }

    await this.cacheService.setAsync(`mission_${id}`, JSON.stringify(mission));

    return this.mapper.map(mission, Mission, GetMissionResponseDto);
  }

  public async createMissionAsync(
    requestDto: CreateMissionRequestDto,
  ): Promise<CreateMissionResponseDto> {
    const { droneId, scheduledStartTime, scheduledEndTime } = requestDto;
    
    const drone = await this.droneService.getDroneAsync(droneId);
    if (!drone) {
      throw new NotFoundException(`Drone with ID '${droneId}' not found`);
    }

    MissionLogic.validateDroneAvailability(drone.status, droneId);

    await this.checkOverlappingMissionAsync(droneId, scheduledStartTime, scheduledEndTime);

    const mission = this.mapper.map(requestDto, CreateMissionRequestDto, Mission);
    const createdMission = this.missionsRepository.create(mission);

    await this.missionsRepository.save(createdMission);

    return this.mapper.map(createdMission, Mission, CreateMissionResponseDto);
  }

  public async updateMissionAsync(
    id: string,
    requestDto: UpdateMissionRequestDto,
  ): Promise<UpdateMissionResponseDto> {
    const mission = await this.missionsRepository.findOne({ where: { id } });

    if (!mission) {
      throw new NotFoundException(`Mission with ID '${id}' not found`);
    }

    if (mission.status !== MissionStatus.PLANNED) {
      throw new BadRequestException("You can only update the details of a 'PLANNED' mission. Once started or completed, its history is immutable.");
    }

    const { droneId, scheduledStartTime, scheduledEndTime } = requestDto;

    if (droneId && droneId !== mission.droneId) {
      const drone = await this.droneService.getDroneAsync(droneId);
      if (!drone) {
        throw new NotFoundException(`Drone with ID '${droneId}' not found`);
      }
      MissionLogic.validateDroneAvailability(drone.status, droneId);
    }

    const targetDroneId = droneId || mission.droneId;
    const targetStart = scheduledStartTime || mission.scheduledStartTime;
    const targetEnd = scheduledEndTime || mission.scheduledEndTime;
    const isTimeScheduled = scheduledStartTime || scheduledEndTime;

    if (droneId || isTimeScheduled) {
      await this.checkOverlappingMissionAsync(targetDroneId, targetStart, targetEnd, id);
    }

    const filteredDto = _.omitBy(requestDto, _.isUndefined);
    Object.assign(mission, filteredDto);

    const updatedMission = await this.missionsRepository.save(mission);
    await this.cacheService.deleteAsync(`mission_${id}`);

    return this.mapper.map(updatedMission, Mission, UpdateMissionResponseDto);
  }

  public async preFlightCheckMissionAsync(id: string): Promise<UpdateMissionResponseDto> {
    return this.processMissionChangeAsync(id, MissionStatus.PRE_FLIGHT_CHECK);
  }

  public async startMissionAsync(id: string): Promise<UpdateMissionResponseDto> {
    const updatedMission = await this.processMissionChangeAsync(id, MissionStatus.IN_PROGRESS);
    const { droneId, id: missionId } = updatedMission;

    this.eventEmitter.emit(MissionEvent.MISSION_STARTED, {
      missionId,
      droneId,
    } as MissionStartedEvent);

    return updatedMission;
  }

  public async completeMissionAsync(id: string, requestDto: CompleteMissionRequestDto): Promise<UpdateMissionResponseDto> {
    const updatedMission = await this.processMissionChangeAsync(id, MissionStatus.COMPLETED, requestDto.flightHoursAtCompletion);
    const { droneId, id: missionId, flightHoursAtCompletion } = updatedMission;

    this.eventEmitter.emit(MissionEvent.MISSION_COMPLETED, {
      missionId,
      droneId,
      flightHours: Number(flightHoursAtCompletion),
    } as MissionCompletedEvent);
    
    return updatedMission;
  }

  public async abortMissionAsync(id: string, requestDto: AbortMissionRequestDto): Promise<UpdateMissionResponseDto> {
    const { flightHoursAtAborting, abortReason } = requestDto;
    const updatedMission = await this.processMissionChangeAsync(id, MissionStatus.ABORTED, undefined, abortReason);
    const { droneId, id: missionId } = updatedMission;

    this.eventEmitter.emit(MissionEvent.MISSION_ABORTED, {
      missionId,
      droneId,
      abortReason,
      flightHoursAtAborting,
    } as MissionAbortedEvent);

    return updatedMission;
  }

  public async softDeleteMissionAsync(id: string): Promise<void> {
    const result = await this.missionsRepository.softDelete({ id });

    if (!result.affected) {
      throw new NotFoundException(`Mission with id ${id} not found!`);
    }

    await this.cacheService.deleteAsync(`mission_${id}`);
  }

  public async hasUpcomingMissionsAsync(droneId: string): Promise<boolean> {
    const upcomingMission = await this.missionsRepository.findOne({
      where: {
        droneId,
        status: Not(In([MissionStatus.COMPLETED, MissionStatus.ABORTED])),
      },
    });

    return Boolean(upcomingMission);
  }

  public async getUpcomingMissionsCountAsync(hours: number): Promise<number> {
    const now = new Date();
    const future = MissionLogic.calculateFutureDate(hours);
    return this.missionsRepository.count({
      where: {
        scheduledStartTime: Between(now, future),
      },
    });
  }

  private async checkOverlappingMissionAsync(
    droneId: string,
    scheduledStart: Date,
    scheduledEnd: Date,
    excludeMissionId?: string,
  ): Promise<void> {
    const overlappingMission = await this.missionsRepository.findOne({
      where: {
        ...(excludeMissionId ? { id: Not(excludeMissionId) } : {}),
        droneId,
        status: Not(In([MissionStatus.ABORTED, MissionStatus.COMPLETED])),
        scheduledStartTime: LessThan(scheduledEnd),
        scheduledEndTime: MoreThan(scheduledStart),
      },
    });

    if (overlappingMission) {
      throw new DomainException(
        `Drone '${droneId}' already has an overlapping mission scheduled during this timeframe.`,
      );
    }
  }

  private async processMissionChangeAsync(
    id: string,
    targetStatus: MissionStatus,
    flightHours?: number,
    abortReason?: string,
  ): Promise<UpdateMissionResponseDto> {
    const mission = await this.missionsRepository.findOne({ where: { id } });
    if (!mission) throw new NotFoundException(`Mission with ID '${id}' not found`);

    MissionLogic.handleStatusChange(mission, targetStatus, flightHours, abortReason);

    const updatedMission = await this.missionsRepository.save(mission);
    await this.cacheService.deleteAsync(`mission_${id}`);
    
    return this.mapper.map(updatedMission, Mission, UpdateMissionResponseDto);
  }
}