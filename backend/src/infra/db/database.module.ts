import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import dataSource from './data-source';
import { DatabaseService } from './database.service';
import { LoggerModule } from '../logger';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forRoot({
      ...dataSource.options,
      autoLoadEntities: true,
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
