import { Module } from '@nestjs/common';
import { CacheModule } from '@/infra/cache';
import { DatabaseModule } from '@/infra/db';
import { LoggerModule } from '@/infra/logger';
import { SwaggerModule } from '@nestjs/swagger';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { DroneModule } from '@/modules/drone';

@Module({
  imports: [
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    DatabaseModule,
    LoggerModule,
    SwaggerModule,
    DroneModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
