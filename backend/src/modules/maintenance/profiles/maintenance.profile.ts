import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper, MappingProfile } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { MaintenanceLog } from '@/modules/maintenance/entities';
import {
  GetMaintenanceLogResponseDto,
  CreateMaintenanceLogResponseDto,
  UpdateMaintenanceLogResponseDto,
} from '@/modules/maintenance/dtos/response';
import {
  CreateMaintenanceLogRequestDto,
  UpdateMaintenanceLogRequestDto,
} from '@/modules/maintenance/dtos/request';

@Injectable()
export class MaintenanceProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile(): MappingProfile {
    return (mapper) => {
      createMap(mapper, MaintenanceLog, GetMaintenanceLogResponseDto,
        forMember(
          (d) => d.type,
          mapFrom((s) => s.type),
        ),
      );
      createMap(mapper, MaintenanceLog, CreateMaintenanceLogResponseDto,
        forMember(
          (d) => d.type,
          mapFrom((s) => s.type),
        ),
      );
      createMap(mapper, MaintenanceLog, UpdateMaintenanceLogResponseDto,
        forMember(
          (d) => d.type,
          mapFrom((s) => s.type),
        ),
      );
      createMap(mapper, CreateMaintenanceLogRequestDto, MaintenanceLog,
        forMember(
          (d) => d.type,
          mapFrom((s) => s.type),
        ),
      );
      createMap(mapper, UpdateMaintenanceLogRequestDto, MaintenanceLog,
        forMember(
          (d) => d.type,
          mapFrom((s) => s.type),
        ),
      );
    };
  }
}
