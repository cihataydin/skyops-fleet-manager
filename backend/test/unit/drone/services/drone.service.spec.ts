import { Test, TestingModule } from '@nestjs/testing';
import { DroneService } from '@/modules/drone/services/drone.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Drone } from '@/modules/drone/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_TOKEN } from '@/shared/di';
import { MISSION_SERVICE_TOKEN } from '@/modules/mission/di';
import { getMapperToken } from '@automapper/nestjs';
import { DroneLogic } from '@/modules/drone/logics';
import { DroneEvent, DroneStatus } from '@/modules/drone/enums';
import { NotFoundException } from '@nestjs/common';
import { GetDronesRequestDto, CreateDroneRequestDto } from '@/modules/drone/dtos/request';
import { LessThan } from 'typeorm';

jest.mock('@/modules/drone/logics', () => ({
  DroneLogic: {
    isFlightHoursExceeded: jest.fn(),
    validateManualStatusUpdate: jest.fn(),
    updateMaintenanceTrackingDates: jest.fn(),
    calculateStatusBreakdown: jest.fn(),
    calculateAverageFlightHours: jest.fn(),
  },
}));

jest.mock('@/shared/utils', () => ({
  PaginationUtil: {
    calculateSkip: jest.fn().mockReturnValue(0),
  },
}));

describe('DroneService', () => {
  let service: DroneService;
  let dronesRepository: any;
  let eventEmitter: any;
  let cacheService: any;
  let mapper: any;
  let missionService: any;

  beforeEach(async () => {
    dronesRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      softDelete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    eventEmitter = { emit: jest.fn() };
    cacheService = { deleteAsync: jest.fn(), getAsync: jest.fn(), setAsync: jest.fn() };
    mapper = { map: jest.fn(), mapArray: jest.fn() };
    missionService = { hasUpcomingMissionAsync: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DroneService,
        { provide: getRepositoryToken(Drone), useValue: dronesRepository },
        { provide: getMapperToken(), useValue: mapper },
        { provide: CACHE_TOKEN, useValue: cacheService },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: MISSION_SERVICE_TOKEN, useValue: missionService },
      ],
    }).compile();

    service = module.get<DroneService>(DroneService);
    jest.clearAllMocks();
  });

  describe('getDronesAsync', () => {
    it('should return paginated drones', async () => {
      const requestDto: GetDronesRequestDto = { limit: 10, page: 1, direction: 'DESC', orderBy: 'model' };
      const drones = [{ id: '1' }];
      dronesRepository.findAndCount.mockResolvedValue([drones, 1]);
      mapper.mapArray.mockReturnValue([{ id: '1' }]);

      const result = await service.getDronesAsync(requestDto);

      expect(result.drones).toBeDefined();
      expect(result.total.count).toBe(1);
      expect(dronesRepository.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        take: 10, skip: 0, order: { model: 'DESC', id: 'asc' }
      }));
    });
  });

  describe('getDroneAsync', () => {
    it('should return drone from cache if exists', async () => {
      const cachedDrone = { id: '1' };
      cacheService.getAsync.mockResolvedValue(cachedDrone);
      mapper.map.mockReturnValue(cachedDrone);

      const result = await service.getDroneAsync('1');

      expect(result).toEqual(cachedDrone);
      expect(dronesRepository.findOne).not.toHaveBeenCalled();
    });

    it('should fetch from db, cache and return if not in cache', async () => {
      cacheService.getAsync.mockResolvedValue(null);
      const dbDrone = { id: '1' };
      dronesRepository.findOne.mockResolvedValue(dbDrone);
      mapper.map.mockReturnValue(dbDrone);

      const result = await service.getDroneAsync('1');

      expect(dronesRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(cacheService.setAsync).toHaveBeenCalledWith('drone_1', JSON.stringify(dbDrone));
      expect(result).toEqual(dbDrone);
    });

    it('should throw NotFoundException if drone not found in db', async () => {
      cacheService.getAsync.mockResolvedValue(null);
      dronesRepository.findOne.mockResolvedValue(null);

      await expect(service.getDroneAsync('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createDroneAsync', () => {
    it('should create and return a drone', async () => {
      const dto = new CreateDroneRequestDto();
      const mappedDrone = new Drone();
      mapper.map.mockReturnValueOnce(mappedDrone).mockReturnValueOnce({ id: '1' });
      dronesRepository.create.mockReturnValue(mappedDrone);
      dronesRepository.save.mockResolvedValue(mappedDrone);

      const result = await service.createDroneAsync(dto);

      expect(dronesRepository.create).toHaveBeenCalledWith(mappedDrone);
      expect(dronesRepository.save).toHaveBeenCalledWith(mappedDrone);
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('updateDroneAsync', () => {
    it('should throw NotFoundException if drone not found', async () => {
      dronesRepository.findOne.mockResolvedValue(null);
      await expect(service.updateDroneAsync('1', {} as any)).rejects.toThrow(NotFoundException);
    });

    it('should update drone, clear cache and return updated drone', async () => {
      const dbDrone = { id: '1', status: DroneStatus.AVAILABLE };
      dronesRepository.findOne.mockResolvedValue(dbDrone);
      missionService.hasUpcomingMissionAsync.mockResolvedValue(false);
      dronesRepository.save.mockResolvedValue(dbDrone);
      mapper.map.mockReturnValue(dbDrone);

      const result = await service.updateDroneAsync('1', { status: DroneStatus.MAINTENANCE });

      expect(DroneLogic.validateManualStatusUpdate).toHaveBeenCalled();
      expect(dronesRepository.save).toHaveBeenCalled();
      expect(cacheService.deleteAsync).toHaveBeenCalledWith('drone_1');
      expect(result).toEqual(dbDrone);
    });
  });

  describe('changeStatusAsync', () => {
    it('should change status, clear cache and update flightHours if provided', async () => {
      const drone = { id: '1', status: DroneStatus.AVAILABLE, flightHoursAtLastMaintenance: 0 };
      dronesRepository.findOne.mockResolvedValue(drone);

      await service.changeStatusAsync('1', DroneStatus.MAINTENANCE, 50);

      expect(drone.status).toBe(DroneStatus.MAINTENANCE);
      expect(drone.flightHoursAtLastMaintenance).toBe(50);
      expect(dronesRepository.save).toHaveBeenCalledWith(drone);
      expect(cacheService.deleteAsync).toHaveBeenCalledWith('drone_1');
    });

    it('should throw NotFoundException if drone not found', async () => {
      dronesRepository.findOne.mockResolvedValue(null);
      await expect(service.changeStatusAsync('1', DroneStatus.MAINTENANCE)).rejects.toThrow(NotFoundException);
    });
  });

  describe('recordFlightHoursAsync', () => {
    it('should return false if addedHours <= 0', async () => {
      const result = await service.recordFlightHoursAsync('1', 0);
      expect(result).toEqual({ maintenanceTriggered: false });
    });

    it('should update and trigger maintenance if exceeded', async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          raw: [{ id: '1', total_flight_hours: '60', flight_hours_at_last_maintenance: '0' }],
        }),
      };
      dronesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      (DroneLogic.isFlightHoursExceeded as jest.Mock).mockReturnValue(true);

      const result = await service.recordFlightHoursAsync('1', 20);

      expect(result).toEqual({ maintenanceTriggered: true });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        DroneEvent.FLIGHT_HOURS_EXCEEDED, 
        expect.objectContaining({ droneId: '1', totalFlightHours: 60 }),
      );
      expect(cacheService.deleteAsync).toHaveBeenCalledWith('drone_1');
    });

    it('should update and not trigger maintenance if not exceeded', async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          raw: [{ id: '1', total_flight_hours: '40', flight_hours_at_last_maintenance: '0' }],
        }),
      };
      dronesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      (DroneLogic.isFlightHoursExceeded as jest.Mock).mockReturnValue(false);

      const result = await service.recordFlightHoursAsync('1', 10);

      expect(result).toEqual({ maintenanceTriggered: false });
      expect(eventEmitter.emit).not.toHaveBeenCalled();
      expect(cacheService.deleteAsync).toHaveBeenCalledWith('drone_1');
    });
  });

  describe('updateMaintenanceTrackingDatesAsync', () => {
    it('should update dates, save and clear cache', async () => {
      const drone = { id: '1' };
      cacheService.getAsync.mockResolvedValue(null);
      dronesRepository.findOne.mockResolvedValue(drone);
      
      const date = new Date();
      await service.updateMaintenanceTrackingDatesAsync('1', date);

      expect(DroneLogic.updateMaintenanceTrackingDates).toHaveBeenCalledWith(drone, date);
      expect(dronesRepository.save).toHaveBeenCalledWith(drone);
      expect(cacheService.deleteAsync).toHaveBeenCalledWith('drone_1');
      expect(cacheService.getAsync).toHaveBeenCalledWith('drone_1');
    });

    it('should throw NotFoundException if not found', async () => {
      dronesRepository.findOne.mockResolvedValue(null);
      await expect(service.updateMaintenanceTrackingDatesAsync('1', new Date())).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDroneStatusBreakdownAsync', () => {
    it('should return total and breakdown', async () => {
      dronesRepository.find.mockResolvedValue([{}, {}]);
      (DroneLogic.calculateStatusBreakdown as jest.Mock).mockReturnValue({ 'AVAILABLE': 2 });

      const result = await service.getDroneStatusBreakdownAsync();

      expect(result).toEqual({ total: 2, breakdown: { 'AVAILABLE': 2 } });
    });
  });

  describe('getMaintenanceAlertDronesAsync', () => {
    it('should query the database with the correct LessThan date threshold', async () => {
      const fixedDate = new Date('2026-07-30T10:00:00.000Z');
      jest.useFakeTimers({ now: fixedDate });
      dronesRepository.find.mockResolvedValue([{ id: '1' }]);
      mapper.mapArray.mockReturnValue([{ id: '1' }]);

      const daysThreshold = 5;
      const expectedThresholdDate = new Date(fixedDate.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
      const result = await service.getMaintenanceAlertDronesAsync(daysThreshold);
    
      expect(result).toEqual([{ id: '1' }]);
      expect(dronesRepository.find).toHaveBeenCalledWith({
        where: {
          nextMaintenanceDueDate: LessThan(expectedThresholdDate),
        },
      });
      jest.useRealTimers();
    });
  });

  describe('getAverageFlightHoursAsync', () => {
    it('should return calculated average', async () => {
      dronesRepository.find.mockResolvedValue([{}, {}]);
      (DroneLogic.calculateAverageFlightHours as jest.Mock).mockReturnValue(50);

      const result = await service.getAverageFlightHoursAsync();

      expect(result).toBe(50);
    });
  });

  describe('softDeleteDroneAsync', () => {
    it('should delete and clear cache', async () => {
      dronesRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.softDeleteDroneAsync('1');

      expect(dronesRepository.softDelete).toHaveBeenCalledWith({ id: '1' });
      expect(cacheService.deleteAsync).toHaveBeenCalledWith('drone_1');
    });

    it('should throw NotFoundException if affected is 0', async () => {
      dronesRepository.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.softDeleteDroneAsync('1')).rejects.toThrow(NotFoundException);
    });
  });
});
