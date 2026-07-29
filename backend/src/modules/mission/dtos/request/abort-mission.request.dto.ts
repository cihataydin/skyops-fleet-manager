import {
  IsString,
  MaxLength,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AbortMissionRequestDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'Reason for aborting the mission',
    example: 'Adverse weather conditions',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  abortReason: string;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Flight hours logged upon aborting the mission',
    example: 3.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  flightHoursAtAborting: number;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Current row version for optimistic locking',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  version?: number;
}
