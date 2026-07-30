import { Test, TestingModule } from '@nestjs/testing';
import { DroneScheduleService } from '@/modules/drone/services/drone-schedule.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Drone } from '@/modules/drone/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LOGGER_TOKEN } from '@/shared/di';
import { DroneEvent } from '@/modules/drone/enums';

describe('DroneScheduleService', () => {
  let service: DroneScheduleService;
  let dronesRepository: any;
  let eventEmitter: any;
  let loggerService: any;

  beforeEach(async () => {
    dronesRepository = {
      find: jest.fn(),
    };
    eventEmitter = {
      emit: jest.fn(),
    };
    loggerService = {
      setContext: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DroneScheduleService,
        { provide: getRepositoryToken(Drone), useValue: dronesRepository },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: LOGGER_TOKEN, useValue: loggerService },
      ],
    }).compile();

    service = module.get<DroneScheduleService>(DroneScheduleService);
  });

  describe('checkMaintenanceDueDatesAsync', () => {
    it('should log and return if no drones are due for maintenance', async () => {
      dronesRepository.find.mockResolvedValue([]);

      await service.checkMaintenanceDueDatesAsync();

      expect(dronesRepository.find).toHaveBeenCalled();
      expect(loggerService.log).toHaveBeenCalledWith(
        'No drones due for 90-day calendar maintenance today.',
      );
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should emit MAINTENANCE_DUE event for each drone that is due', async () => {
      const dueDrones = [
        {
          id: 'drone-1',
          totalFlightHours: '10',
          nextMaintenanceDueDate: new Date(),
        },
        {
          id: 'drone-2',
          totalFlightHours: '20',
          nextMaintenanceDueDate: new Date(),
        },
      ];
      dronesRepository.find.mockResolvedValue(dueDrones);

      await service.checkMaintenanceDueDatesAsync();

      expect(dronesRepository.find).toHaveBeenCalled();
      expect(loggerService.log).toHaveBeenCalledWith(
        'Found 2 drone(s) due for 90-day calendar maintenance.',
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        DroneEvent.MAINTENANCE_DUE,
        expect.objectContaining({
          droneId: 'drone-1',
          reason: 'CALENDAR_90_DAYS',
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        DroneEvent.MAINTENANCE_DUE,
        expect.objectContaining({
          droneId: 'drone-2',
          reason: 'CALENDAR_90_DAYS',
        }),
      );
    });
  });
});
