import { AutoMap } from '@automapper/classes';
import { BaseFilterRequestDto } from '@/shared/dtos';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaintenanceType } from '@/modules/maintenance/enums';

export class GetMaintenanceLogsRequestDto extends BaseFilterRequestDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Filter by drone ID',
  })
  @AutoMap()
  @IsOptional()
  @IsUUID()
  droneId?: string;

  @ApiProperty({
    type: MaintenanceType,
    enum: MaintenanceType,
    enumName: 'MaintenanceType',
    required: false,
  })
  @AutoMap()
  @IsEnum(MaintenanceType, { message: 'Invalid maintenance type provided.' })
  @IsOptional()
  type?: MaintenanceType;
}
