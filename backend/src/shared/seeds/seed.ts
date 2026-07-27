import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Drone } from '@/modules/drone/entities';
import { Mission } from '@/modules/mission/entities';
import { MaintenanceLog } from '@/modules/maintenance/entities';
import { Repository } from 'typeorm';
import { DroneModel, DroneStatus } from '@/modules/drone/enums';
import { MissionStatus, MissionType } from '@/modules/mission/enums';
import { MaintenanceType } from '@/modules/maintenance/enums';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const droneRepo = app.get<Repository<Drone>>(getRepositoryToken(Drone));
  const missionRepo = app.get<Repository<Mission>>(getRepositoryToken(Mission));
  const maintenanceRepo = app.get<Repository<MaintenanceLog>>(getRepositoryToken(MaintenanceLog));

  console.log('Seeding Database...');

  // Clear existing
  await maintenanceRepo.query('TRUNCATE TABLE maintenance_logs, missions, drones CASCADE');

  // 1. Seed Drones (20+)
  const drones: Drone[] = [];
  const models = Object.values(DroneModel);
  const statuses = Object.values(DroneStatus);

  for (let i = 1; i <= 25; i++) {
    const drone = droneRepo.create({
      serialNumber: `SKY-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      model: models[i % Object.keys(DroneModel).length],
      status: statuses[i % Object.keys(DroneStatus).length],
      totalFlightHours: Math.floor(Math.random() * 200),
      lastMaintenanceDate: new Date(Date.now() - Math.random() * 10000000000),
      version: 1,
    });
    
    // Naive next maintenance date logic for seed
    const nextDue = new Date(drone.lastMaintenanceDate);
    nextDue.setDate(nextDue.getDate() + 90);
    drone.nextMaintenanceDueDate = nextDue;

    drones.push(drone);
  }
  await droneRepo.save(drones);
  console.log(`Saved ${drones.length} drones.`);

  // 2. Seed Missions (50+)
  const missions: Mission[] = [];
  const missionTypes = Object.values(MissionType);
  const pilots = ['Cihat Aydin', 'John Doe', 'Jane Smith', 'Alice Johnson'];

  for (let i = 1; i <= 55; i++) {
    const drone = drones[Math.floor(Math.random() * drones.length)];
    const start = new Date(Date.now() + (Math.random() * 10 - 5) * 24 * 60 * 60 * 1000); // Between -5 to +5 days
    const end = new Date(start.getTime() + (Math.random() * 5 + 1) * 60 * 60 * 1000); // 1-6 hours long
    
    let status = MissionStatus.PLANNED;
    if (start < new Date()) {
      status = Math.random() > 0.2 ? MissionStatus.COMPLETED : MissionStatus.ABORTED;
    }

    missions.push(missionRepo.create({
      name: `Mission ${i}`,
      type: missionTypes[i % Object.keys(MissionType).length],
      pilotName: pilots[i % pilots.length],
      siteLocation: `Site ${i}`,
      droneId: drone.id,
      scheduledStartTime: start,
      scheduledEndTime: end,
      status: status,
      flightHoursAtCompletion: status === MissionStatus.COMPLETED ? Math.floor(Math.random() * 5) + 1 : 0,
      actualStartTime: status === MissionStatus.COMPLETED ? start : undefined,
      actualEndTime: status === MissionStatus.COMPLETED ? end : undefined,
      abortReason: status === MissionStatus.ABORTED ? 'Bad Weather' : undefined,
      version: 1,
    }));
  }
  await missionRepo.save(missions);
  console.log(`Saved ${missions.length} missions.`);

  // 3. Seed Maintenance Logs (30+)
  const logs: MaintenanceLog[] = [];
  const mainTypes = Object.values(MaintenanceType);
  
  for (let i = 1; i <= 35; i++) {
    const drone = drones[Math.floor(Math.random() * drones.length)];
    logs.push(maintenanceRepo.create({
      droneId: drone.id,
      type: mainTypes[i % Object.keys(MaintenanceType).length],
      technicianName: 'Tech ' + (i % 5),
      performedAt: new Date(Date.now() - Math.random() * 5000000000),
      flightHoursAtMaintenance: Number(drone.totalFlightHours) - Math.floor(Math.random() * 10),
      notes: 'Routine check ' + i,
      version: 1,
    }));
  }
  await maintenanceRepo.save(logs);
  console.log(`Saved ${logs.length} maintenance logs.`);

  console.log('Seeding completed!');
  await app.close();

  process.exit(0);
}
bootstrap();
