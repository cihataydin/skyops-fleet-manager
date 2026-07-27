import {
  Controller,
  Get,
  Post,
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
import { IMaintenanceService } from '@/modules/maintenance/interfaces';
import {
  CreateMaintenanceLogRequestDto,
  GetMaintenanceLogsRequestDto,
} from '@/modules/maintenance/dtos/request';
import { MAINTENANCE_SERVICE_TOKEN } from '@/modules/maintenance/di';
import { formatResponse } from '@/shared/utils';

@ApiTags('maintenance')
@Controller('maintenance')
export class MaintenanceController {
  public constructor(
    @Inject(MAINTENANCE_SERVICE_TOKEN)
    private readonly maintenanceService: IMaintenanceService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lists maintenance logs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The list of maintenance logs has been successfully retrieved.',
  })
  public async getMaintenanceLogsAsync(@Query() requestDto: GetMaintenanceLogsRequestDto) {
    const { limit } = requestDto;
    const {
      logs,
      total: { page, count },
    } = await this.maintenanceService.getMaintenanceLogsAsync(requestDto);

    return formatResponse(logs, {
      total: count,
      page,
      limit,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieves information about a specific maintenance log' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the maintenance log',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The maintenance log information has been successfully retrieved.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Maintenance log not found.',
  })
  public async getMaintenanceLogAsync(@Param('id', ParseUUIDPipe) id: string) {
    const responseDto = await this.maintenanceService.getMaintenanceLogAsync(id);

    return formatResponse(responseDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Creates a new maintenance log' })
  @ApiBody({
    type: CreateMaintenanceLogRequestDto,
    description: 'The data for the maintenance log to be created',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The maintenance log has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body or missing data.',
  })
  public async createMaintenanceLogAsync(
    @Body() createMaintenanceLogDto: CreateMaintenanceLogRequestDto,
  ) {
    const responseDto = await this.maintenanceService.createMaintenanceLogAsync(
      createMaintenanceLogDto,
    );

    return formatResponse(responseDto);
  }
}
