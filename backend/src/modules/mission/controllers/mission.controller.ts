import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
} from '@nestjs/swagger';
import { IMissionService } from '@/modules/mission/interfaces';
import {
  CreateMissionRequestDto,
  GetMissionsRequestDto,
  UpdateMissionRequestDto,
  CompleteMissionRequestDto,
  AbortMissionRequestDto,
} from '@/modules/mission/dtos/request';
import { MISSION_SERVICE_TOKEN } from '@/modules/mission/di';
import { formatResponse } from '@/shared/utils';
import { CreateMissionResponseDto, GetMissionResponseDto, UpdateMissionResponseDto } from '@/modules/mission/dtos/response';

@ApiTags('missions')
@Controller('missions')
export class MissionController {
  public constructor(
    @Inject(MISSION_SERVICE_TOKEN)
    private readonly missionsService: IMissionService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lists missions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The list of missions has been successfully retrieved.',
  })
  public async getMissionsAsync(@Query() requestDto: GetMissionsRequestDto) {
    const { limit } = requestDto;
    const {
      missions,
      total: { page, count },
    } = await this.missionsService.getMissionsAsync(requestDto);

    return formatResponse(missions, {
      total: count,
      page,
      limit,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieves information about a specific mission' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the mission',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetMissionResponseDto,
    description: 'The mission information has been successfully retrieved.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Mission not found.',
  })
  public async getMissionAsync(@Param('id', ParseUUIDPipe) id: string) {
    const responseDto = await this.missionsService.getMissionAsync(id);

    return formatResponse(responseDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Creates a new mission' })
  @ApiBody({
    type: CreateMissionRequestDto,
    description: 'The data for the mission to be created',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateMissionResponseDto,
    description: 'The mission has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body or missing data.',
  })
  public async createMissionAsync(
    @Body() createMissionDto: CreateMissionRequestDto,
  ) {
    const responseDto = await this.missionsService.createMissionAsync(
      createMissionDto,
    );

    return formatResponse(responseDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Updates an existing mission' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the mission to update',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateMissionRequestDto,
    description: 'The data for the mission to be updated',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateMissionResponseDto,
    description: 'The mission has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Mission not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body or missing data.',
  })
  public async updateMissionAsync(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMissionDto: UpdateMissionRequestDto,
  ) {
    const responseDto = await this.missionsService.updateMissionAsync(
      id,
      updateMissionDto,
    );

    return formatResponse(responseDto);
  }

  @Patch(':id/pre-flight')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Starts pre-flight check for a mission' })
  public async preFlightCheckMissionAsync(@Param('id', ParseUUIDPipe) id: string) {
    const responseDto = await this.missionsService.preFlightCheckMissionAsync(id);
    return formatResponse(responseDto);
  }
  

  @Patch(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Starts a mission (IN_PROGRESS)' })
  public async startMissionAsync(@Param('id', ParseUUIDPipe) id: string) {
    const responseDto = await this.missionsService.startMissionAsync(id);
    return formatResponse(responseDto);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Completes a mission' })
  public async completeMissionAsync(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() completeMissionDto: CompleteMissionRequestDto,
  ) {
    const responseDto = await this.missionsService.completeMissionAsync(id, completeMissionDto);
    return formatResponse(responseDto);
  }

  @Patch(':id/abort')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aborts a mission' })
  public async abortMissionAsync(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() abortMissionDto: AbortMissionRequestDto,
  ) {
    const responseDto = await this.missionsService.abortMissionAsync(id, abortMissionDto);
    return formatResponse(responseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes a specific mission (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the mission to delete',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The mission has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Mission not found.',
  })
  public async softDeleteMissionAsync(@Param('id', ParseUUIDPipe) id: string) {
    await this.missionsService.softDeleteMissionAsync(id);
  }
}