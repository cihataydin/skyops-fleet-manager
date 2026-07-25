import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { DroneModel } from '@/modules/drone/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class CreateDroneRequestDto {
  @ApiProperty({ 
    type: String, 
    required: true, description: 'Serial number of the drone (exactly 13 characters long)', 
    example: 'SKY-1234-5678' 
  })
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  @Length(13, 13, { message: 'Serial number must be exactly 13 characters long.' })
  serialNumber: string;

  @ApiProperty({ 
    type: String, 
    required: true, 
    description: 'Model of the drone', 
    enum: DroneModel, 
    example: DroneModel.MATRICE_300
  })
  @AutoMap()
  @IsNotEmpty()
  @IsEnum(DroneModel, { message: 'Invalid drone model provided.' })
  model: DroneModel;
}