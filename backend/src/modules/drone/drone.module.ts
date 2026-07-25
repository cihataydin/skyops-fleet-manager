import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drone } from './entities';
import { DroneController } from '@/modules/drone/controllers';
import { DroneService } from '@/modules/drone/services';
import { DroneProfile } from '@/modules/drone/profiles';
import { DRONES_SERVICE_TOKEN } from '@/modules/drone/di';
import { CacheModule } from '@/infra/cache';
import { Mission } from '@/modules/mission/entities';
import { MaintenanceLog } from '@/modules/maintenance/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Drone, Mission, MaintenanceLog]),
    CacheModule,
  ],
  controllers: [DroneController],
  providers: [
    DroneProfile,
    {
      provide: DRONES_SERVICE_TOKEN,
      useClass: DroneService,
    },
  ],
})
export class DroneModule
{}
