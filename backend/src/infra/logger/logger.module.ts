import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';

import { LOGGER_TOKEN } from '../../shared/di';
import { LoggerInterceptor } from './logger.interceptor';
import { LoggerService } from './logger.service';
import { createWinstonLogger } from './winston.config';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = createWinstonLogger(config);
        return {
          instance: logger,
          transports: logger.transports,
        };
      },
    }),
  ],
  providers: [
    {
      provide: LOGGER_TOKEN,
      useClass: LoggerService,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
  exports: [LOGGER_TOKEN],
})
export class LoggerModule {}
