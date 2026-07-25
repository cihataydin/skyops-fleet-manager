import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { Transform } from 'class-transformer';

export class BaseFilterRequestDto {
  @ApiProperty({ type: Number, required: false, default: 1 })
  @Transform(({ value }) => parseInt(value, 10))
  @AutoMap()
  @IsOptional()
  @Min(1)
  @IsNumber()
  public page?: number;

  @ApiProperty({
    type: Number,
    maximum: 100,
    minimum: 1,
    required: false,
    default: 50,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @AutoMap()
  @IsOptional()
  @Max(100)
  @Min(1)
  @IsNumber()
  public limit?: number;

  @ApiProperty({ type: String, required: false, default: 'createdAt' })
  @AutoMap()
  @IsOptional()
  @IsString()
  public orderBy?: string;

  @ApiProperty({
    type: String,
    enum: ['asc', 'desc'],
    required: false,
    default: 'asc',
  })
  @AutoMap()
  @IsOptional()
  @IsString()
  public direction?: string;

  public constructor() {
    this.page = 1;
    this.limit = 50;
    this.orderBy = 'createdAt';
    this.direction = 'desc';
  }
}
