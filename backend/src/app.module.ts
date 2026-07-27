import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@/infra/db';
import { LoggerModule } from '@/infra/logger';
import { SwaggerModule } from '@nestjs/swagger';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { DroneModule } from '@/modules/drone';
import { MissionModule } from '@/modules/mission';
import { MaintenanceModule } from '@/modules/maintenance';
import { ReportModule } from '@/modules/report';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    DatabaseModule,
    LoggerModule,
    SwaggerModule,
    DroneModule,
    MissionModule,
    MaintenanceModule,
    ReportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
