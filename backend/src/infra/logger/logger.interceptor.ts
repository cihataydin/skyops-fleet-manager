import {
  NestInterceptor,
  Injectable,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { LOGGER_TOKEN } from '../../shared/di';

import { ILoggerService } from './logger.interface';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(@Inject(LOGGER_TOKEN) private readonly logger: ILoggerService) {
    this.logger.setContext(this.constructor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, headers, query, body } = req;

    this.logger.debug(`Request: ${method} ${url}`, {
      headers,
      query,
      body,
    });

    const now = Date.now();
    return next.handle().pipe(
      tap((responseData) => {
        const res = context.switchToHttp().getResponse();
        this.logger.debug(`Response: ${method} ${url}`, {
          statusCode: res.statusCode,
          duration: `${Date.now() - now}ms`,
          response: responseData,
        });
      }),
    );
  }
}
