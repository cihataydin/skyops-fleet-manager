import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DroneModel } from '@/modules/drone/enums';
import { DroneStatus } from '@/modules/drone/enums';
import { MissionStatus } from '@/modules/mission/enums';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

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
    const droneSerialNumber = `SKY-INTE-TEST`;
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

    console.log(createMissionRes.body);
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
    
    await new Promise((resolve) => setTimeout(resolve, 500));

    const finalDroneRes = await request(app.getHttpServer()).get(
      `/drones/${droneId}`,
    );

    expect(finalDroneRes.body.data).toBeDefined();
    expect(Number(finalDroneRes.body.data.totalFlightHours)).toBe(10);
    expect(finalDroneRes.body.data.status).toBe(DroneStatus.AVAILABLE);
  });
});
