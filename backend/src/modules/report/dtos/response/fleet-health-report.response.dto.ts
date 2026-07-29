import { ApiProperty } from '@nestjs/swagger';
import { GetDroneResponseDto } from '@/modules/drone/dtos/response';

export class FleetHealthReportResponseDto {
  @ApiProperty({ description: 'Total number of drones in the fleet' })
  totalDroneCount: number;

  @ApiProperty({
    description: 'Breakdown of drones by their current status',
    type: 'object',
  })
  statusBreakdown: Record<string, number>;

  @ApiProperty({
    description: 'List of drones that have overdue maintenance',
    type: [GetDroneResponseDto],
  })
  overdueMaintenanceDrones: GetDroneResponseDto[];

  @ApiProperty({
    description: 'Number of missions scheduled in the next 24 hours',
  })
  missionsNext24Hours: number;

  @ApiProperty({ description: 'Average flight hours across the entire fleet' })
  averageFlightHours: number;
}
