import { AutoMap } from '@automapper/classes';

export class TotalResponseDto {
  @AutoMap()
  public count: number;

  @AutoMap()
  public page: number;
}
