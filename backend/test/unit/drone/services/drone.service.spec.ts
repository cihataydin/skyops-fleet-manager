import { Test, TestingModule } from '@nestjs/testing';
import { DroneService } from '@/modules/drone/services/drone.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Drone } from '@/modules/drone/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_TOKEN } from '@/shared/di';
import { MISSION_SERVICE_TOKEN } from '@/modules/mission/di';
import { getMapperToken } from '@automapper/nestjs';
import { DroneLogic } from '@/modules/drone/logics';
import { DroneEvent } from '@/modules/drone/enums';

describe('DroneService', () => {
  let service: DroneService;
  let dronesRepository: any;
  let eventEmitter: any;

  beforeEach(async () => {
    dronesRepository = {
      createQueryBuilder: jest.fn(),
    };
    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DroneService,
        { provide: getRepositoryToken(Drone), useValue: dronesRepository },
        { provide: getMapperToken(), useValue: {} },
        {
          provide: CACHE_TOKEN,
          useValue: { deleteAsync: jest.fn(), getAsync: jest.fn(), setAsync: jest.fn() },
        },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: MISSION_SERVICE_TOKEN, useValue: {} },
      ],
    }).compile();

    service = module.get<DroneService>(DroneService);
  });

  describe('recordFlightHoursAsync', () => {
    it('should return false if addedHours is <= 0', async () => {
      const result = await service.recordFlightHoursAsync('drone-1', 0);
      expect(result).toEqual({ maintenanceTriggered: false });
      expect(dronesRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should update flight hours and return maintenanceTriggered=false if limit not exceeded', async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          raw: [{ id: 'drone-1', total_flight_hours: '40', flight_hours_at_last_maintenance: '0' }],
        }),
      };
      dronesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      jest.spyOn(DroneLogic, 'isFlightHoursExceeded').mockReturnValue(false);

      const result = await service.recordFlightHoursAsync('drone-1', 10);
      expect(result).toEqual({ maintenanceTriggered: false });
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should update flight hours, emit event, and return maintenanceTriggered=true if limit exceeded', async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          raw: [{ id: 'drone-1', total_flight_hours: '60', flight_hours_at_last_maintenance: '0' }],
        }),
      };
      dronesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      jest.spyOn(DroneLogic, 'isFlightHoursExceeded').mockReturnValue(true);

      const result = await service.recordFlightHoursAsync('drone-1', 20);
      expect(result).toEqual({ maintenanceTriggered: true });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        DroneEvent.FLIGHT_HOURS_EXCEEDED,
        expect.objectContaining({ droneId: 'drone-1', totalFlightHours: 60 }),
      );
    });
  });
});
