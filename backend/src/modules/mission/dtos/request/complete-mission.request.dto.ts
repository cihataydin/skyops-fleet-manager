import { IsNumber, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteMissionRequestDto {
  @ApiProperty({ 
    type: Number, 
    required: true, 
    description: 'Flight hours logged upon completion of the mission', 
    example: 3.5 
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  flightHoursAtCompletion: number;
}
