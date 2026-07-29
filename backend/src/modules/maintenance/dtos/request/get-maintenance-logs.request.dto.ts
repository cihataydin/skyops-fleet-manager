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
    required: false,
    enum: MaintenanceType,
    enumName: 'MaintenanceType',
    description: 'Filter by maintenance type',
  })
  @AutoMap()
  @IsOptional()
  @IsEnum(MaintenanceType, {
    message: `Invalid maintenance type provided. It must be one of the allowed values: ${Object.values(MaintenanceType).join(', ')}`,
  })
  type?: MaintenanceType;
}
