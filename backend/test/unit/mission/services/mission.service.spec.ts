import { Test, TestingModule } from '@nestjs/testing';
import { MissionService } from '@/modules/mission/services/mission.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Mission } from '@/modules/mission/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { CACHE_TOKEN } from '@/shared/di';
import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { DomainException } from '@/shared/exceptions';
import { MissionStatus } from '@/modules/mission/enums';
import { DroneStatus } from '@/modules/drone/enums';

describe('MissionService - Overlap Detection', () => {
  let service: MissionService;
  let missionRepository: any;

  beforeEach(async () => {
    missionRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionService,
        {
          provide: getRepositoryToken(Mission),
          useValue: missionRepository,
        },
        {
          provide: DRONE_SERVICE_TOKEN,
          useValue: {
            getDroneAsync: jest
              .fn()
              .mockResolvedValue({ status: DroneStatus.AVAILABLE }),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
        {
          provide: CACHE_TOKEN,
          useValue: {
            getAsync: jest.fn(),
            setAsync: jest.fn(),
            deleteAsync: jest.fn(),
          },
        },
        {
          provide: getMapperToken(),
          useValue: { map: jest.fn(), mapArray: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MissionService>(MissionService);
  });

  describe('createMissionAsync', () => {
    it('should throw DomainException if there is an overlapping mission', async () => {
      missionRepository.findOne.mockResolvedValueOnce({
        id: 'existing-mission',
      });

      const requestDto: any = {
        droneId: 'drone-1',
        scheduledStartTime: new Date('2026-07-28T10:00:00Z'),
        scheduledEndTime: new Date('2026-07-28T12:00:00Z'),
      };

      await expect(service.createMissionAsync(requestDto)).rejects.toThrow(
        DomainException,
      );
      expect(missionRepository.findOne).toHaveBeenCalled();
    });

    it('should create mission if no overlapping mission is found', async () => {
      missionRepository.findOne.mockResolvedValueOnce(null);
      missionRepository.create.mockReturnValue({ id: 'new-mission' });
      missionRepository.save.mockResolvedValue({ id: 'new-mission' });

      const requestDto: any = {
        droneId: 'drone-1',
        scheduledStartTime: new Date('2026-07-28T10:00:00Z'),
        scheduledEndTime: new Date('2026-07-28T12:00:00Z'),
      };

      const result = await service.createMissionAsync(requestDto);
      expect(missionRepository.findOne).toHaveBeenCalled();
      expect(missionRepository.create).toHaveBeenCalled();
      expect(missionRepository.save).toHaveBeenCalled();
    });
  });
});
