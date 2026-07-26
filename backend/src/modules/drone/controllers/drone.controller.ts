import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  Query,
  HttpCode,
  Inject,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { IDroneService } from '@/modules/drone/interfaces';
import {
  CreateDroneRequestDto,
  GetDronesRequestDto,
  UpdateDroneRequestDto,
} from '@/modules/drone/dtos/request';
import { DRONE_SERVICE_TOKEN } from '@/modules/drone/di';
import { formatResponse } from '@/shared/utils';

@ApiTags('drones')
@Controller('drones')
export class DroneController {
  public constructor(
    @Inject(DRONE_SERVICE_TOKEN)
    private readonly dronesService: IDroneService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lists drones' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The list of drones has been successfully retrieved.',
  })
  public async getDronesAsync(@Query() requestDto: GetDronesRequestDto) {
    const { limit } = requestDto;
    const {
      drones,
      total: { page, count },
    } = await this.dronesService.getDronesAsync(requestDto);

    return formatResponse(drones, {
      total: count,
      page,
      limit,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieves information about a specific drone' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the drone',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The drone information has been successfully retrieved.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Drone not found.',
  })
  public async getDroneAsync(@Param('id', ParseUUIDPipe) id: string) {
    const responseDto = await this.dronesService.getDroneAsync(id);

    return formatResponse(responseDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Creates a new drone' })
  @ApiBody({
    type: CreateDroneRequestDto,
    description: 'The data for the drone to be created',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The drone has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body or missing data.',
  })
  public async createDroneAsync(
    @Body() createDroneDto: CreateDroneRequestDto,
  ) {
    const responseDto = await this.dronesService.createDroneAsync(
      createDroneDto,
    );

    return formatResponse(responseDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Updates an existing drone' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the drone to update',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateDroneRequestDto,
    description: 'The data for the drone to be updated',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The drone has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Drone not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body or missing data.',
  })
  public async updateDroneAsync(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDroneDto: UpdateDroneRequestDto,
  ) {
    const responseDto = await this.dronesService.updateDroneAsync(
      id,
      updateDroneDto,
    );

    return formatResponse(responseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes a specific drone (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the drone to delete',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The drone has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Drone not found.',
  })
  public async softDeleteDroneAsync(@Param('id', ParseUUIDPipe) id: string) {
    await this.dronesService.softDeleteDroneAsync(id);
  }
}