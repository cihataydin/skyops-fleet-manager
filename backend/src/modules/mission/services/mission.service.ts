import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, LessThan, MoreThan } from 'typeorm';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Mission } from '@/modules/mission/entities';
import { CreateMissionRequestDto, GetMissionsRequestDto, UpdateMissionRequestDto } from '@/modules/mission/dtos/request';
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
import { MissionLogic } from '../logics';

@Injectable()
export class MissionService implements IMissionService {
  public constructor(
    @InjectRepository(Mission)
    private missionsRepository: Repository<Mission>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(CACHE_TOKEN) private readonly cacheService: ICacheService,
    @Inject(DRONE_SERVICE_TOKEN) private readonly droneService: IDroneService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async getMissionsAsync(
    requestDto: GetMissionsRequestDto,
  ): Promise<GetMissionsResponseDto> {
    const { limit, page, direction, orderBy, name, type, status, droneId, pilotName } = requestDto;
    const where = {
      ...(name ? { name } : {}),
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(droneId ? { droneId } : {}),
      ...(pilotName ? { pilotName } : {}),
    };
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

    // TODO: already date type? why?
    const scheduledStart = new Date(scheduledStartTime);
    const scheduledEnd = new Date(scheduledEndTime);

    MissionLogic.validateScheduledDates(scheduledStart, scheduledEnd);
    await this.checkOverlappingMissionAsync(droneId, scheduledStart, scheduledEnd);

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

    if (requestDto.droneId && requestDto.droneId !== mission.droneId) {
      const drone = await this.droneService.getDroneAsync(requestDto.droneId);
      if (!drone) {
        throw new NotFoundException(`Drone with ID '${requestDto.droneId}' not found`);
      }
    }

    const targetDroneId = requestDto.droneId || mission.droneId;
    const targetStart = requestDto.scheduledStartTime ? new Date(requestDto.scheduledStartTime) : mission.scheduledStartTime;
    const targetEnd = requestDto.scheduledEndTime ? new Date(requestDto.scheduledEndTime) : mission.scheduledEndTime;

    if (requestDto.scheduledStartTime || requestDto.scheduledEndTime) {
      MissionLogic.validateScheduledDates(targetStart, targetEnd);
    }

    if (requestDto.droneId || requestDto.scheduledStartTime || requestDto.scheduledEndTime) {
      await this.checkOverlappingMissionAsync(targetDroneId, targetStart, targetEnd, id);
    }

    const oldStatus = mission.status;
    MissionLogic.handleStatusChange(
      mission,
      requestDto.status,
      requestDto.flightHoursAtCompletion,
      requestDto.abortReason,
    );

    this.mapper.map(requestDto, UpdateMissionRequestDto, Mission);

    const filteredDto = _.omitBy(requestDto, _.isUndefined);
    Object.assign(mission, filteredDto);

    const updatedMission = await this.missionsRepository.save(mission);
    await this.cacheService.deleteAsync(`mission_${id}`);

    this.emitLifecycleEvents(updatedMission, oldStatus);

    return this.mapper.map(updatedMission, Mission, UpdateMissionResponseDto);
  }

  public async softDeleteMissionAsync(id: string): Promise<void> {
    const result = await this.missionsRepository.softDelete({ id });

    if (!result.affected) {
      throw new NotFoundException(`Mission with id ${id} not found!`);
    }

    await this.cacheService.deleteAsync(`mission_${id}`);
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
        status: Not(MissionStatus.ABORTED),
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

  private emitLifecycleEvents(updatedMission: Mission, oldStatus: MissionStatus): void {
    const { droneId, id: missionId, status: newStatus } = updatedMission;

    if (MissionLogic.isMissionStarted(oldStatus, newStatus)) {
      this.eventEmitter.emit(MissionEvent.MISSION_STARTED, {
        missionId,
        droneId,
      });
    } else if (MissionLogic.isMissionCompleted(oldStatus, newStatus)) {
      this.eventEmitter.emit(MissionEvent.MISSION_COMPLETED, {
        missionId,
        droneId,
        flightHoursLogged: Number(updatedMission.flightHoursAtCompletion),
      });
    } else if (MissionLogic.isMissionAborted(oldStatus, newStatus)) {
      this.eventEmitter.emit(MissionEvent.MISSION_ABORTED, {
        missionId,
        droneId,
        abortReason: updatedMission.abortReason,
      });
    }
  }
}