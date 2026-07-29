import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Drone } from '@/modules/drone/entities';
import {
  GetDroneResponseDto,
  CreateDroneResponseDto,
  UpdateDroneResponseDto,
} from '@/modules/drone/dtos/response';
import {
  CreateDroneRequestDto,
  UpdateDroneRequestDto,
} from '@/modules/drone/dtos/request';
import { UpdateDroneRequestModel } from '@/modules/drone/models/request';

@Injectable()
export class DroneProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile(): MappingProfile {
    return (mapper) => {
      createMap(
        mapper,
        Drone,
        GetDroneResponseDto,
        forMember(
          (d) => d.model,
          mapFrom((s) => s.model),
        ),
        forMember(
          (d) => d.status,
          mapFrom((s) => s.status),
        ),
      );
      createMap(
        mapper,
        Drone,
        CreateDroneResponseDto,
        forMember(
          (d) => d.model,
          mapFrom((s) => s.model),
        ),
        forMember(
          (d) => d.status,
          mapFrom((s) => s.status),
        ),
      );
      createMap(
        mapper,
        Drone,
        UpdateDroneResponseDto,
        forMember(
          (d) => d.model,
          mapFrom((s) => s.model),
        ),
        forMember(
          (d) => d.status,
          mapFrom((s) => s.status),
        ),
      );
      createMap(
        mapper,
        CreateDroneRequestDto,
        Drone,
        forMember(
          (d) => d.model,
          mapFrom((s) => s.model),
        ),
      );
      createMap(
        mapper,
        UpdateDroneRequestDto,
        UpdateDroneRequestModel,
        forMember(
          (d) => d.model,
          mapFrom((s) => s.model),
        ),
        forMember(
          (d) => d.status,
          mapFrom((s) => s.status),
        ),
      );
      createMap(
        mapper,
        UpdateDroneRequestModel,
        Drone,
        forMember(
          (d) => d.model,
          mapFrom((s) => s.model),
        ),
        forMember(
          (d) => d.status,
          mapFrom((s) => s.status),
        ),
      );
    };
  }
}
