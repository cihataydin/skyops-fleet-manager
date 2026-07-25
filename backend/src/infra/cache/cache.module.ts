import { Module } from '@nestjs/common';
import { RedisModule, RedisModuleOptions } from '@songkeys/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CACHE_TOKEN } from '../../shared/di';

import { CacheService } from './cache.service';
import { LoggerModule } from '../logger';

@Module({
  imports: [
    LoggerModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          config: {
            host: config.get<string>('CACHE_HOST', '127.0.0.1'),
            port: config.get<string>('CACHE_PORT', '6379'),
          },
        } as unknown as RedisModuleOptions;
      },
    }),
  ],
  providers: [{ provide: CACHE_TOKEN, useClass: CacheService }],
  exports: [CACHE_TOKEN],
})
export class CacheModule {}
