import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DroneModel } from '@/modules/drone/enums';
import { DroneStatus } from '@/modules/drone/enums';
import { MissionStatus } from '@/modules/mission/enums';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

const waitForCondition = async (
  checkFn: () => Promise<boolean>,
  maxWaitMs: number = 2000,
  intervalMs: number = 50,
): Promise<void> => {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    if (await checkFn()) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error('Timeout waiting for condition');
};

describe('Mission Lifecycle (Integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:15-alpine').start();

    process.env.DATABASE_HOST = container.getHost();
    process.env.DATABASE_PORT = container.getPort().toString();
    process.env.DATABASE_USERNAME = container.getUsername();
    process.env.DATABASE_PASSWORD = container.getPassword();
    process.env.DATABASE_NAME = container.getDatabase();

    const { AppModule } = await import('@/app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(getDataSourceToken());
    await dataSource.runMigrations();
  }, 60000);

  afterAll(async () => {
    await app.close();
    if (container) {
      await container.stop();
    }
  });

  it('should successfully complete a full mission lifecycle', async () => {
    // 1. Create a Drone
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const droneSerialNumber = `SKY-INT1-${randomSuffix}`;
    const createDroneRes = await request(app.getHttpServer())
      .post('/drones')
      .send({
        serialNumber: droneSerialNumber,
        model: DroneModel.MATRICE_300,
      });

    expect(createDroneRes.status).toBe(201);
    const droneId = createDroneRes.body.data.id;
    expect(createDroneRes.body.data.status).toBe(DroneStatus.AVAILABLE);

    // 2. Schedule a Mission
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    const createMissionRes = await request(app.getHttpServer())
      .post('/missions')
      .send({
        droneId,
        name: 'Integration Test Mission',
        type: 'WIND_TURBINE_INSPECTION',
        pilotName: 'John Doe',
        siteLocation: 'Test Site 1',
        scheduledStartTime: tomorrow.toISOString(),
        scheduledEndTime: dayAfter.toISOString(),
      });

    expect(createMissionRes.status).toBe(201);
    const missionId = createMissionRes.body.data.id;
    expect(createMissionRes.body.data.status).toBe(MissionStatus.PLANNED);

    // 3. Pre-Flight Check
    const preFlightRes = await request(app.getHttpServer()).patch(
      `/missions/${missionId}/pre-flight`,
    );
    expect(preFlightRes.status).toBe(200);
    expect(preFlightRes.body.data.status).toBe(MissionStatus.PRE_FLIGHT_CHECK);

    // 4. Start Mission
    const startMissionRes = await request(app.getHttpServer()).patch(
      `/missions/${missionId}/start`,
    );
    expect(startMissionRes.status).toBe(200);
    expect(startMissionRes.body.data.status).toBe(MissionStatus.IN_PROGRESS);

    // 5. Complete Mission
    const completeMissionRes = await request(app.getHttpServer())
      .patch(`/missions/${missionId}/complete`)
      .send({ flightHoursAtCompletion: 10 });
    expect(completeMissionRes.status).toBe(200);
    expect(completeMissionRes.body.data.status).toBe(MissionStatus.COMPLETED);

    // 6. Verify State
    const getDroneRes = await request(app.getHttpServer()).get(
      `/drones/${droneId}`,
    );
    expect(getDroneRes.status).toBe(200);
    
    await waitForCondition(async () => {
      const res = await request(app.getHttpServer()).get(`/drones/${droneId}`);
      return res.body?.data?.status === DroneStatus.AVAILABLE;
    });

    const finalDroneRes = await request(app.getHttpServer()).get(
      `/drones/${droneId}`,
    );

    expect(finalDroneRes.body.data).toBeDefined();
    expect(Number(finalDroneRes.body.data.totalFlightHours)).toBe(10);
    expect(finalDroneRes.body.data.status).toBe(DroneStatus.AVAILABLE);
  });

  it('should successfully abort a mission and restore drone state', async () => {
    // 1. Create a Drone
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const droneSerialNumber = `SKY-ABRT-${randomSuffix}`;
    const createDroneRes = await request(app.getHttpServer())
      .post('/drones')
      .send({
        serialNumber: droneSerialNumber,
        model: DroneModel.MATRICE_300,
      });

    expect(createDroneRes.status).toBe(201);
    const droneId = createDroneRes.body.data.id;

    // 2. Schedule a Mission
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    const createMissionRes = await request(app.getHttpServer())
      .post('/missions')
      .send({
        droneId,
        name: 'Abort Test Mission',
        type: 'WIND_TURBINE_INSPECTION',
        pilotName: 'Jane Doe',
        siteLocation: 'Test Site 2',
        scheduledStartTime: tomorrow.toISOString(),
        scheduledEndTime: dayAfter.toISOString(),
      });

    expect(createMissionRes.status).toBe(201);
    const missionId = createMissionRes.body.data.id;

    // 3. Start Mission
    await request(app.getHttpServer()).patch(`/missions/${missionId}/pre-flight`);
    await request(app.getHttpServer()).patch(`/missions/${missionId}/start`);

    // 4. Abort Mission
    const abortMissionRes = await request(app.getHttpServer())
      .patch(`/missions/${missionId}/abort`)
      .send({ flightHoursAtAborting: 2, abortReason: 'Bad weather condition' });
    
    expect(abortMissionRes.status).toBe(200);
    expect(abortMissionRes.body.data.status).toBe(MissionStatus.ABORTED);

    // 5. Verify State (Wait for async event)
    await waitForCondition(async () => {
      const res = await request(app.getHttpServer()).get(`/drones/${droneId}`);
      return res.body?.data?.status === DroneStatus.AVAILABLE;
    });

    const finalDroneRes = await request(app.getHttpServer()).get(`/drones/${droneId}`);
    expect(Number(finalDroneRes.body.data.totalFlightHours)).toBe(2);
    expect(finalDroneRes.body.data.status).toBe(DroneStatus.AVAILABLE);
  });
});
