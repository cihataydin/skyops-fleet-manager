import { IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { DroneModel } from '@/modules/drone/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class CreateDroneRequestDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'Serial number of the drone (exactly 13 characters long)',
    example: 'SKY-AB12-CD34',
  })
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  @Length(13, 13, {
    message: 'Serial number must be exactly 13 characters long.',
  })
  @Matches(/^SKY-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/, {
    message:
      'Serial number must be in the format SKY-XXXX-XXXX where X is alphanumeric',
  })
  serialNumber: string;

  @ApiProperty({
    type: DroneModel,
    required: true,
    enum: DroneModel,
    enumName: 'DroneModel',
    description: 'Model of the drone',
    example: DroneModel.MATRICE_300,
  })
  @AutoMap()
  @IsNotEmpty()
  @IsEnum(DroneModel, {
    message: `Invalid drone model provided. It must be one of the allowed values: ${Object.values(DroneModel).join(', ')}`,
  })
  model: DroneModel;
}
