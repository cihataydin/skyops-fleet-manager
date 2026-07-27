import { Module } from '@nestjs/common';
import { ReportController } from './controllers/report.controller';
import { ReportService } from './services/report.service';
import { REPORT_SERVICE_TOKEN } from './di';
import { DroneModule } from '@/modules/drone';
import { MissionModule } from '@/modules/mission';

@Module({
  imports: [
    DroneModule,
    MissionModule,
  ],
  controllers: [ReportController],
  providers: [
    {
      provide: REPORT_SERVICE_TOKEN,
      useClass: ReportService,
    },
  ],
})
export class ReportModule {}
