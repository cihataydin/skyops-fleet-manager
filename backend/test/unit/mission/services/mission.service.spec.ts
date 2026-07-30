import { Test, TestingModule } from '@nestjs/testing';
import { MissionService } from '@/modules/mission/services/mission.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Mission } from '@/modules/mission/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_TOKEN } from '@/shared/di';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { getMapperToken } from '@automapper/nestjs';
import { MissionLogic } from '@/modules/mission/logics';
import { MissionStatus, MissionEvent } from '@/modules/mission/enums';
import { DroneStatus } from '@/modules/drone/enums';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DomainException } from '@/shared/exceptions';
import { CreateMissionRequestDto, GetMissionsRequestDto, UpdateMissionRequestDto, CompleteMissionRequestDto, AbortMissionRequestDto } from '@/modules/mission/dtos/request';

jest.mock('@/modules/mission/logics', () => ({
  MissionLogic: {
    validateDroneAvailability: jest.fn(),
    handleStatusChange: jest.fn(),
    calculateFutureDate: jest.fn(),
    validateDroneStateForMissionStart: jest.fn(),
  },
}));

jest.mock('@/shared/utils', () => ({
  PaginationUtil: {
    calculateSkip: jest.fn().mockReturnValue(0),
  },
}));

describe('MissionService', () => {
  let service: MissionService;
  let missionsRepository: any;
  let eventEmitter: any;
  let cacheService: any;
  let mapper: any;
  let droneService: any;

  beforeEach(async () => {
    missionsRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
      count: jest.fn(),
    };
    eventEmitter = { emit: jest.fn() };
    cacheService = { deleteAsync: jest.fn(), getAsync: jest.fn(), setAsync: jest.fn() };
    mapper = { map: jest.fn(), mapArray: jest.fn() };
    droneService = { getDroneAsync: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionService,
        { provide: getRepositoryToken(Mission), useValue: missionsRepository },
        { provide: getMapperToken(), useValue: mapper },
        { provide: CACHE_TOKEN, useValue: cacheService },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: DRONE_SERVICE_TOKEN, useValue: droneService },
      ],
    }).compile();

    service = module.get<MissionService>(MissionService);
    jest.clearAllMocks();
  });

  describe('getMissionsAsync', () => {
    it('should return paginated missions', async () => {
      const requestDto: GetMissionsRequestDto = { limit: 10, page: 1, direction: 'DESC', orderBy: 'status', startDate: new Date(), endDate: new Date() };
      missionsRepository.findAndCount.mockResolvedValue([[{ id: '1' }], 1]);
      mapper.mapArray.mockReturnValue([{ id: '1' }]);

      const result = await service.getMissionsAsync(requestDto);

      expect(result).toBeDefined();
      expect(missionsRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('getMissionAsync', () => {
    it('should return from cache if exists', async () => {
      cacheService.getAsync.mockResolvedValue({ id: '1' });
      mapper.map.mockReturnValue({ id: '1' });

      const result = await service.getMissionAsync('1');

      expect(result).toEqual({ id: '1' });
      expect(missionsRepository.findOne).not.toHaveBeenCalled();
      expect(cacheService.getAsync).toHaveBeenCalled();
    });

    it('should fetch from db and cache if not in cache', async () => {
      cacheService.getAsync.mockResolvedValue(null);
      missionsRepository.findOne.mockResolvedValue({ id: '1' });
      mapper.map.mockReturnValue({ id: '1' });

      const result = await service.getMissionAsync('1');

      expect(result).toBeDefined();
      expect(missionsRepository.findOne).toHaveBeenCalled();
      expect(cacheService.setAsync).toHaveBeenCalled();
    });

    it('should throw NotFoundException if not in db', async () => {
      cacheService.getAsync.mockResolvedValue(null);
      missionsRepository.findOne.mockResolvedValue(null);

      await expect(service.getMissionAsync('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createMissionAsync', () => {
    it('should throw NotFoundException if drone not found', async () => {
      droneService.getDroneAsync.mockResolvedValue(null);
      await expect(service.createMissionAsync({ droneId: '1' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should create and return mission', async () => {
      droneService.getDroneAsync.mockResolvedValue({ status: DroneStatus.AVAILABLE });
      missionsRepository.findOne.mockResolvedValue(null);
      mapper.map.mockReturnValueOnce(new Mission()).mockReturnValueOnce({ id: '1' });
      missionsRepository.create.mockReturnValue(new Mission());
      missionsRepository.save.mockResolvedValue(new Mission());

      const result = await service.createMissionAsync({ droneId: '1', scheduledStartTime: new Date(), scheduledEndTime: new Date() } as any);
      
      expect(result).toEqual({ id: '1' });
      expect(MissionLogic.validateDroneAvailability).toHaveBeenCalled();
      expect(missionsRepository.save).toHaveBeenCalled();
    });

    it('should throw DomainException if overlapping mission exists', async () => {
      droneService.getDroneAsync.mockResolvedValue({ status: DroneStatus.AVAILABLE });
      missionsRepository.findOne.mockResolvedValue({ id: 'existing' });

      await expect(service.createMissionAsync({ droneId: '1', scheduledStartTime: new Date(), scheduledEndTime: new Date() } as any)).rejects.toThrow(DomainException);
    });
  });

  describe('updateMissionAsync', () => {
    it('should throw NotFoundException if mission not found', async () => {
      missionsRepository.findOne.mockResolvedValue(null);
      await expect(service.updateMissionAsync('1', {} as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if mission is not PLANNED', async () => {
      missionsRepository.findOne.mockResolvedValue({ status: MissionStatus.IN_PROGRESS });
      await expect(service.updateMissionAsync('1', {} as any)).rejects.toThrow(BadRequestException);
    });

    it('should check overlapping if drone or schedule changed', async () => {
      missionsRepository.findOne.mockResolvedValueOnce({ status: MissionStatus.PLANNED, droneId: '1' }); 
      droneService.getDroneAsync.mockResolvedValue({ status: DroneStatus.AVAILABLE });
      missionsRepository.findOne.mockResolvedValueOnce({ id: 'overlapping' });

      await expect(service.updateMissionAsync('1', { droneId: '2' } as any)).rejects.toThrow(DomainException);
    });

    it('should update mission and clear cache', async () => {
      missionsRepository.findOne.mockResolvedValueOnce({ status: MissionStatus.PLANNED, droneId: '1' }); 
      missionsRepository.save.mockResolvedValue({ id: '1' });
      mapper.map.mockReturnValue({ id: '1' });

      const result = await service.updateMissionAsync('1', { name: 'New Name' } as any);

      expect(missionsRepository.save).toHaveBeenCalled();
      expect(cacheService.deleteAsync).toHaveBeenCalledWith('mission_1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('Mission Status Changes', () => {
    beforeEach(() => {
      missionsRepository.findOne.mockResolvedValue({ id: '1', droneId: 'd1', status: MissionStatus.PLANNED });
      droneService.getDroneAsync.mockResolvedValue({ status: DroneStatus.AVAILABLE });
      missionsRepository.save.mockResolvedValue({ id: '1', droneId: 'd1' });
      mapper.map.mockReturnValue({ id: '1', droneId: 'd1' });
    });

    it('preFlightCheckMissionAsync should process correctly', async () => {
      await service.preFlightCheckMissionAsync('1');
      expect(MissionLogic.handleStatusChange).toHaveBeenCalledWith(expect.anything(), MissionStatus.PRE_FLIGHT_CHECK, undefined, undefined);
      expect(cacheService.deleteAsync).toHaveBeenCalledWith('mission_1');
    });

    it('startMissionAsync should process and emit event', async () => {
      await service.startMissionAsync('1');
      expect(MissionLogic.handleStatusChange).toHaveBeenCalledWith(expect.anything(), MissionStatus.IN_PROGRESS, undefined, undefined);
      expect(eventEmitter.emit).toHaveBeenCalledWith(MissionEvent.MISSION_STARTED, expect.any(Object));
    });

    it('completeMissionAsync should process and emit event', async () => {
      await service.completeMissionAsync('1', { flightHoursAtCompletion: 5 } as any);
      expect(MissionLogic.handleStatusChange).toHaveBeenCalledWith(expect.anything(), MissionStatus.COMPLETED, 5, undefined);
      expect(eventEmitter.emit).toHaveBeenCalledWith(MissionEvent.MISSION_COMPLETED, expect.any(Object));
    });

    it('abortMissionAsync should process and emit event', async () => {
      await service.abortMissionAsync('1', { abortReason: 'Weather', flightHoursAtAborting: 2 } as any);
      expect(MissionLogic.handleStatusChange).toHaveBeenCalledWith(expect.anything(), MissionStatus.ABORTED, undefined, 'Weather');
      expect(eventEmitter.emit).toHaveBeenCalledWith(MissionEvent.MISSION_ABORTED, expect.any(Object));
    });

    it('should throw NotFoundException if mission not found during status change', async () => {
      missionsRepository.findOne.mockResolvedValue(null);
      await expect(service.startMissionAsync('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDeleteMissionAsync', () => {
    it('should delete and clear cache', async () => {
      missionsRepository.softDelete.mockResolvedValue({ affected: 1 });
      await service.softDeleteMissionAsync('1');
      expect(cacheService.deleteAsync).toHaveBeenCalledWith('mission_1');
    });

    it('should throw NotFoundException if affected is 0', async () => {
      missionsRepository.softDelete.mockResolvedValue({ affected: 0 });
      await expect(service.softDeleteMissionAsync('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('hasUpcomingMissionAsync', () => {
    it('should return true if upcoming mission exists', async () => {
      missionsRepository.findOne.mockResolvedValue({});
      expect(await service.hasUpcomingMissionAsync('1')).toBe(true);
    });

    it('should return false if no upcoming mission exists', async () => {
      missionsRepository.findOne.mockResolvedValue(null);
      expect(await service.hasUpcomingMissionAsync('1')).toBe(false);
    });
  });

  describe('getUpcomingMissionsCountAsync', () => {
    it('should return count', async () => {
      missionsRepository.count.mockResolvedValue(5);
      (MissionLogic.calculateFutureDate as jest.Mock).mockReturnValue(new Date());
      expect(await service.getUpcomingMissionsCountAsync(24)).toBe(5);
    });
  });
});
