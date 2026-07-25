import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import { RedisService } from '@songkeys/nestjs-redis';
import { Redis } from 'ioredis';

import { LOGGER_TOKEN } from '../../shared/di';
import { ILoggerService } from '../logger';

import { ICacheService } from './cache.interface';

@Injectable()
export class CacheService
  implements ICacheService, OnModuleDestroy, OnApplicationShutdown
{
  private readonly cacheProvider: Redis;

  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILoggerService,
    @Optional() private readonly redisService: RedisService,
  ) {
    this.logger.setContext(this.constructor.name);
    this.cacheProvider = this.redisService?.getClient();
  }

  public async getAsync<T>(key: string): Promise<T> {
    const value = await this.cacheProvider?.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  public getStatus(): string {
    return this.cacheProvider?.status.toString();
  }

  public async setAsync(
    key: string,
    value: string,
    ttl?: number,
  ): Promise<void> {
    if (ttl) {
      await this.cacheProvider?.set(key, value, 'EX', ttl);
      return;
    }

    await this.cacheProvider?.set(key, value);
  }

  public async deleteAsync(key: string): Promise<void> {
    await this.cacheProvider?.del(key);
  }

  public async disconect(): Promise<void> {
    if (this.cacheProvider?.status === 'ready') {
      await this.cacheProvider.quit();
    }
  }

  public async onModuleDestroy() {
    this.logger.info('[onModuleDestroy] shutting down CacheService...');
    await this.disconect();
  }

  public async onApplicationShutdown(signal?: string) {
    this.logger.info(
      `[onApplicationShutdown] shutting down CacheService with signal: ${signal}`,
    );
    await this.disconect();
  }
}
