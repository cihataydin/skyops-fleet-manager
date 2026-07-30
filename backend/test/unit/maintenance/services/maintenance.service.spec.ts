import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceService } from '@/modules/maintenance/services/maintenance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MaintenanceLog } from '@/modules/maintenance/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_TOKEN } from '@/shared/di';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { getMapperToken } from '@automapper/nestjs';
import { MaintenanceLogic } from '@/modules/maintenance/logics';
import { DroneStatus } from '@/modules/drone/enums';
import { MaintenanceEvent } from '@/modules/maintenance/enums';
import { NotFoundException } from '@nestjs/common';
import {
  CreateMaintenanceLogRequestDto,
  GetMaintenanceLogsRequestDto,
} from '@/modules/maintenance/dtos/request';
import { DomainException } from '@/shared/exceptions';

jest.mock('@/modules/maintenance/logics', () => ({
  MaintenanceLogic: {
    validateFlightHoursAtMaintenance: jest.fn(),
  },
}));

jest.mock('@/shared/utils', () => ({
  PaginationUtil: {
    calculateSkip: jest.fn().mockReturnValue(0),
  },
}));

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let maintenanceLogsRepository: any;
  let eventEmitter: any;
  let cacheService: any;
  let mapper: any;
  let droneService: any;

  beforeEach(async () => {
    maintenanceLogsRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    eventEmitter = { emit: jest.fn() };
    cacheService = { getAsync: jest.fn(), setAsync: jest.fn() };
    mapper = { map: jest.fn(), mapArray: jest.fn() };
    droneService = { getDroneAsync: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        {
          provide: getRepositoryToken(MaintenanceLog),
          useValue: maintenanceLogsRepository,
        },
        { provide: getMapperToken(), useValue: mapper },
        { provide: CACHE_TOKEN, useValue: cacheService },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: DRONE_SERVICE_TOKEN, useValue: droneService },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);
    jest.clearAllMocks();
  });

  describe('getMaintenanceLogsAsync', () => {
    it('should return paginated logs', async () => {
      const requestDto: GetMaintenanceLogsRequestDto = {
        limit: 10,
        page: 1,
        direction: 'DESC',
        orderBy: 'performedAt',
        droneId: 'd1',
      } as any;
      maintenanceLogsRepository.findAndCount.mockResolvedValue([
        [{ id: '1' }],
        1,
      ]);
      mapper.mapArray.mockReturnValue([{ id: '1' }]);

      const result = await service.getMaintenanceLogsAsync(requestDto);

      expect(result).toBeDefined();
      expect(maintenanceLogsRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
          order: { performedAt: 'DESC', id: 'asc' },
        }),
      );
    });
  });

  describe('getMaintenanceLogAsync', () => {
    it('should return log from cache if exists', async () => {
      cacheService.getAsync.mockResolvedValue({ id: '1' });
      mapper.map.mockReturnValue({ id: '1' });

      const result = await service.getMaintenanceLogAsync('1');

      expect(result).toEqual({ id: '1' });
      expect(maintenanceLogsRepository.findOne).not.toHaveBeenCalled();
    });

    it('should fetch from db and cache if not in cache', async () => {
      cacheService.getAsync.mockResolvedValue(null);
      maintenanceLogsRepository.findOne.mockResolvedValue({ id: '1' });
      mapper.map.mockReturnValue({ id: '1' });

      const result = await service.getMaintenanceLogAsync('1');

      expect(maintenanceLogsRepository.findOne).toHaveBeenCalled();
      expect(cacheService.setAsync).toHaveBeenCalled();
      expect(result).toEqual({ id: '1' });
    });

    it('should throw NotFoundException if log not found in db', async () => {
      cacheService.getAsync.mockResolvedValue(null);
      maintenanceLogsRepository.findOne.mockResolvedValue(null);

      await expect(service.getMaintenanceLogAsync('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createMaintenanceLogAsync', () => {
    const requestDto: CreateMaintenanceLogRequestDto = {
      droneId: '1',
      flightHoursAtMaintenance: 100,
      description: 'Test log',
      performedAt: new Date(),
    } as any;

    it('should throw NotFoundException if drone not found', async () => {
      droneService.getDroneAsync.mockResolvedValue(null);
      await expect(
        service.createMaintenanceLogAsync(requestDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw DomainException if drone is not in MAINTENANCE status', async () => {
      droneService.getDroneAsync.mockResolvedValue({
        status: DroneStatus.AVAILABLE,
      });
      await expect(
        service.createMaintenanceLogAsync(requestDto),
      ).rejects.toThrow(DomainException);
    });

    it('should create log and emit event if valid', async () => {
      droneService.getDroneAsync.mockResolvedValue({
        status: DroneStatus.MAINTENANCE,
        totalFlightHours: 100,
      });
      mapper.map
        .mockReturnValueOnce(new MaintenanceLog())
        .mockReturnValueOnce({ id: '1' });

      const createdLog = new MaintenanceLog();
      createdLog.performedAt = new Date();
      createdLog.droneId = '1';

      maintenanceLogsRepository.create.mockReturnValue(createdLog);
      maintenanceLogsRepository.save.mockResolvedValue(createdLog);

      const result = await service.createMaintenanceLogAsync(requestDto);

      expect(
        MaintenanceLogic.validateFlightHoursAtMaintenance,
      ).toHaveBeenCalledWith(100, 100);
      expect(maintenanceLogsRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        MaintenanceEvent.MAINTENANCE_CREATED,
        expect.objectContaining({
          droneId: '1',
          flightHoursAtMaintenance: 100,
        }),
      );
      expect(result).toEqual({ id: '1' });
    });
  });
});
