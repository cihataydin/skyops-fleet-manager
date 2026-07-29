import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { QueryFailedError, OptimisticLockVersionMismatchError } from 'typeorm';
import { LOGGER_TOKEN } from '@/shared/di';
import { ILoggerService } from '@/infra/logger';

@Catch(QueryFailedError, OptimisticLockVersionMismatchError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  constructor(@Inject(LOGGER_TOKEN) private readonly logger: ILoggerService) {
    this.logger.setContext(TypeOrmExceptionFilter.name);
  }

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected database error occurred.';

    if (exception instanceof QueryFailedError) {
      const err = exception as any;
      if (err.code === '23505') {
        status = HttpStatus.CONFLICT;
        message =
          'The resource you are trying to create or update already exists (Duplicate record).';
      }
    } else if (exception instanceof OptimisticLockVersionMismatchError) {
      status = HttpStatus.CONFLICT;
      message =
        'This record was modified by another user/process. Please refresh and try again.';
    }

    this.logger.error(
      `[${status}] ${message} - ${exception.message}`,
      undefined,
      exception.stack,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error: HttpStatus[status],
    });
  }
}
