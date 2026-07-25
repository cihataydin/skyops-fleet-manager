import { Inject, Injectable, Scope } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ILoggerService } from './logger.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements ILoggerService {
  private context?: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, meta?: Record<string, any>) {
    this.logger.info(message, this.getLogMeta(meta));
  }

  info(message: string, meta?: Record<string, any>) {
    this.logger.info(message, this.getLogMeta(meta));
  }

  error(message: string, meta?: Record<string, any>, trace?: string) {
    this.logger.error(message, this.getLogMeta({ ...meta, trace }));
  }

  warn(message: string, meta?: Record<string, any>) {
    this.logger.warn(message, this.getLogMeta(meta));
  }

  debug(message: string, meta?: Record<string, any>) {
    this.logger.debug(message, this.getLogMeta(meta));
  }

  private getLogMeta(meta?: Record<string, any>) {
    return {
      context: this.context,
      timestamp: new Date().toISOString(),
      ...(meta || {}),
    };
  }
}
