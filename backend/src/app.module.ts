import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infra/db';
import { LoggerModule } from '@/infra/logger';
import { SwaggerModule } from '@nestjs/swagger';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { DroneModule } from '@/modules/drone';
import { MissionModule } from './modules/mission';

@Module({
  imports: [
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    DatabaseModule,
    LoggerModule,
    SwaggerModule,
    DroneModule,
    MissionModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
