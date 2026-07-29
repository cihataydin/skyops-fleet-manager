import 'dotenv/config';
import { join } from 'path';

import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

const configService = new ConfigService();
const nodeEnv = configService.get<string>('NODE_ENV', 'development');
const host = configService.get<string>('DATABASE_HOST', 'localhost');
const port = configService.get<number>('DATABASE_PORT', 5432);
const schema = configService.get<string>('DATABASE_SCHEMA', 'public');
const username = configService.get<string>('DATABASE_USERNAME', 'admin');
const password = configService.get<string>('DATABASE_PASSWORD', 'admin');
const database = configService.get<string>('DATABASE_NAME', 'fleetManagerDB');
const logging = configService.get<boolean>('DATABASE_LOGGING', true);

// TODO: make sure it works also for /src source path
const sourcePath = nodeEnv === 'production' ? 'dist' : 'src';
// const sourcePath = 'dist';

const dataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  schema,
  entities: [join(process.cwd(), sourcePath, '**/!(base).entity.ts')],
  migrations: [join(process.cwd(), sourcePath, `/**/migrations/*.ts`)],
  logging,
});

export default dataSource;
