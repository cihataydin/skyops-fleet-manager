import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from './entities';
import { MissionController } from '@/modules/mission/controllers';
import { MissionService } from '@/modules/mission/services';
import { MissionProfile } from '@/modules/mission/profiles';
import { MISSION_SERVICE_TOKEN } from '@/modules/mission/di';
import { CacheModule } from '@/infra/cache';
import { Drone } from '@/modules/drone/entities';
import { DroneModule } from '../drone';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mission, Drone]),
    CacheModule,
    DroneModule
  ],
  controllers: [MissionController],
  providers: [
    MissionProfile,
    {
      provide: MISSION_SERVICE_TOKEN,
      useClass: MissionService,
    },
  ],
})
export class MissionModule
{}