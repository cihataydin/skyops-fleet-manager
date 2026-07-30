import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drone } from './entities';
import { DroneController } from '@/modules/drone/controllers';
import { DroneService, DroneScheduleService } from '@/modules/drone/services';
import { DroneProfile } from '@/modules/drone/profiles';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { CacheModule } from '@/infra/cache';
import { LoggerModule } from '@/infra/logger';
import { Mission } from '@/modules/mission/entities';
import { MaintenanceLog } from '@/modules/maintenance/entities';
import {
  MaintenanceListener,
  MissionListener,
  DroneInternalListener,
} from '@/modules/drone/listeners';
import { MissionModule } from '@/modules/mission';

@Module({
  imports: [
    TypeOrmModule.forFeature([Drone, Mission, MaintenanceLog]),
    CacheModule,
    LoggerModule,
    forwardRef(() => MissionModule),
  ],
  controllers: [DroneController],
  providers: [
    DroneProfile,
    MaintenanceListener,
    MissionListener,
    DroneInternalListener,
    DroneScheduleService,
    {
      provide: DRONE_SERVICE_TOKEN,
      useClass: DroneService,
    },
  ],
  exports: [DRONE_SERVICE_TOKEN],
})
export class DroneModule {}
