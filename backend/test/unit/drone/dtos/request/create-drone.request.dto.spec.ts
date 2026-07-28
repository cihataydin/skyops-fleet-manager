import { validate } from 'class-validator';
import { CreateDroneRequestDto } from '@/modules/drone/dtos/request/create-drone.request.dto';
import { DroneModel } from '@/modules/drone/enums';

describe('CreateDroneRequestDto', () => {
  it('should pass validation with a valid serial number and model', async () => {
    const dto = new CreateDroneRequestDto();
    dto.serialNumber = 'SKY-ABCD-1234';
    dto.model = DroneModel.MATRICE_300;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if serial number is not exactly 13 characters', async () => {
    const dto = new CreateDroneRequestDto();
    dto.serialNumber = 'SKY-ABC-123';
    dto.model = DroneModel.MATRICE_300;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('serialNumber');
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

  it('should fail validation if serial number does not match format SKY-XXXX-XXXX', async () => {
    const dto = new CreateDroneRequestDto();
    dto.serialNumber = 'WRONG-ABCD-12';
    dto.model = DroneModel.MATRICE_300;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('serialNumber');
    expect(errors[0].constraints).toHaveProperty('matches');
  });
});
