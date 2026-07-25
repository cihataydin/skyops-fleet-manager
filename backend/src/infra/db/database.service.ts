import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { LOGGER_TOKEN } from '../../shared/di';
import { ILoggerService } from '../logger';

@Injectable()
export class DatabaseService implements OnModuleDestroy, OnApplicationShutdown {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILoggerService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public async disconnect(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  public async onModuleDestroy() {
    this.logger.info('[onModuleDestroy] shutting down DatabaseService...');
    await this.disconnect();
  }

  public async onApplicationShutdown(signal?: string) {
    this.logger.info(
      `[onApplicationShutdown] shutting down DatabaseService with signal: ${signal}`,
    );
    await this.disconnect();
  }
}
