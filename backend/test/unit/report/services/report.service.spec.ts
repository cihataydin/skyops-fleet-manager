import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from '@/modules/report/services/report.service';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { MISSION_SERVICE_TOKEN } from '@/modules/mission/di';

describe('ReportService', () => {
  let service: ReportService;
  let droneService: any;
  let missionService: any;

  beforeEach(async () => {
    droneService = {
      getDroneStatusBreakdownAsync: jest.fn(),
      getMaintenanceAlertDronesAsync: jest.fn(),
      getAverageFlightHoursAsync: jest.fn(),
    };

    missionService = {
      getUpcomingMissionsCountAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: DRONE_SERVICE_TOKEN,
          useValue: droneService,
        },
        {
          provide: MISSION_SERVICE_TOKEN,
          useValue: missionService,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  describe('getFleetHealthReportAsync', () => {
    it('should correctly aggregate data from services to generate a fleet health report', async () => {
      droneService.getDroneStatusBreakdownAsync.mockResolvedValue({
        total: 10,
        breakdown: { AVAILABLE: 5, IN_MAINTENANCE: 2, RETIRED: 3 },
      });
      droneService.getMaintenanceAlertDronesAsync.mockResolvedValue([
        { id: 'drone-1' },
      ]);
      droneService.getAverageFlightHoursAsync.mockResolvedValue(55.56);
      missionService.getUpcomingMissionsCountAsync.mockResolvedValue(4);

      const report = await service.getFleetHealthReportAsync(3);

      expect(report.totalDroneCount).toBe(10);
      expect(report.statusBreakdown).toEqual({
        AVAILABLE: 5,
        IN_MAINTENANCE: 2,
        RETIRED: 3,
      });
      expect(report.overdueMaintenanceDrones).toEqual([{ id: 'drone-1' }]);
      expect(report.averageFlightHours).toBe(55.56);
      expect(report.missionsNext24Hours).toBe(4);

      expect(droneService.getDroneStatusBreakdownAsync).toHaveBeenCalled();
      expect(droneService.getMaintenanceAlertDronesAsync).toHaveBeenCalledWith(
        3,
      );
      expect(droneService.getAverageFlightHoursAsync).toHaveBeenCalled();
      expect(missionService.getUpcomingMissionsCountAsync).toHaveBeenCalledWith(
        24,
      );
    });
  });
});
