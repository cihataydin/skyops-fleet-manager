import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper, MappingProfile } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { MaintenanceLog } from '@/modules/maintenance/entities';
import {
  GetMaintenanceLogResponseDto,
  CreateMaintenanceLogResponseDto,
} from '@/modules/maintenance/dtos/response';
import {
  CreateMaintenanceLogRequestDto,
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
      createMap(mapper, CreateMaintenanceLogRequestDto, MaintenanceLog,
        forMember(
          (d) => d.type,
          mapFrom((s) => s.type),
        ),
      );
    };
  }
}
