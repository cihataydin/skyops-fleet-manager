import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Mission } from '@/modules/mission/entities';
import {
  GetMissionResponseDto,
  CreateMissionResponseDto,
  UpdateMissionResponseDto,
} from '@/modules/mission/dtos/response';
import {
  CreateMissionRequestDto,
  UpdateMissionRequestDto,
} from '@/modules/mission/dtos/request';

@Injectable()
export class MissionProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile(): MappingProfile {
    return (mapper) => {
      createMap(
        mapper,
        Mission,
        GetMissionResponseDto,
        forMember(
          (d) => d.type,
          mapFrom((s) => s.type),
        ),
        forMember(
          (d) => d.status,
          mapFrom((s) => s.status),
        ),
      );
      createMap(
        mapper,
        Mission,
        CreateMissionResponseDto,
        forMember(
          (d) => d.type,
          mapFrom((s) => s.type),
        ),
        forMember(
          (d) => d.status,
          mapFrom((s) => s.status),
        ),
      );
      createMap(
        mapper,
        Mission,
        UpdateMissionResponseDto,
        forMember(
          (d) => d.type,
          mapFrom((s) => s.type),
        ),
        forMember(
          (d) => d.status,
          mapFrom((s) => s.status),
        ),
      );
      createMap(
        mapper,
        CreateMissionRequestDto,
        Mission,
        forMember(
          (d) => d.type,
          mapFrom((s) => s.type),
        ),
      );
      createMap(
        mapper,
        UpdateMissionRequestDto,
        Mission,
        forMember(
          (d) => d.type,
          mapFrom((s) => s.type),
        ),
      );
    };
  }
}
