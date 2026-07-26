import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceLog } from './entities';
import { MaintenanceController } from '@/modules/maintenance/controllers';
import { MaintenanceService } from '@/modules/maintenance/services';
import { MaintenanceProfile } from '@/modules/maintenance/profiles';
import { MAINTENANCE_SERVICE_TOKEN } from '@/modules/maintenance/di';
import { CacheModule } from '@/infra/cache';
import { DroneModule } from '@/modules/drone';
import { DroneMaintenanceListener } from '@/modules/maintenance/listeners';
import { LoggerModule } from '@/infra/logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceLog]),
    CacheModule,
    LoggerModule,
    DroneModule
  ],
  controllers: [MaintenanceController],
  providers: [
    MaintenanceProfile,
    DroneMaintenanceListener,
    {
      provide: MAINTENANCE_SERVICE_TOKEN,
      useClass: MaintenanceService,
    },
  ],
})
export class MaintenanceModule {}
