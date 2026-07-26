import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drone } from './entities';
import { DroneController } from '@/modules/drone/controllers';
import { DroneService } from '@/modules/drone/services';
import { DroneProfile } from '@/modules/drone/profiles';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { CacheModule } from '@/infra/cache';
import { LoggerModule } from '@/infra/logger';
import { Mission } from '@/modules/mission/entities';
import { MaintenanceLog } from '@/modules/maintenance/entities';
import { MaintenanceListener } from './listeners';

@Module({
  imports: [
    TypeOrmModule.forFeature([Drone, Mission, MaintenanceLog]),
    CacheModule,
    LoggerModule,
  ],
  controllers: [DroneController],
  providers: [
    DroneProfile,
    MaintenanceListener,
    {
      provide: DRONE_SERVICE_TOKEN,
      useClass: DroneService,
    },
  ],
  exports: [DRONE_SERVICE_TOKEN],
})
export class DroneModule
{}
