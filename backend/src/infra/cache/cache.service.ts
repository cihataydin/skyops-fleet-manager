import { Inject, Injectable, Optional } from '@nestjs/common';
import { RedisService } from '@songkeys/nestjs-redis';
import { Redis } from 'ioredis';

import { LOGGER_TOKEN } from '../../shared/di';
import { ILoggerService } from '../logger';

import { ICacheService } from './cache.interface';

@Injectable()
export class CacheService implements ICacheService {
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
}
