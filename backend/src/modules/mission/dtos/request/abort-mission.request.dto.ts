import { IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AbortMissionRequestDto {
  @ApiProperty({ 
    type: String, 
    required: true, 
    description: 'Reason for aborting the mission', 
    example: 'Adverse weather conditions' 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  abortReason: string;
}
