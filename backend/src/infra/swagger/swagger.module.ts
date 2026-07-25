import * as fs from 'fs';
import { join } from 'path';

import { DynamicModule, INestApplication, Module } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule as NestSwaggerModule,
} from '@nestjs/swagger';

import { ConfigService } from '@nestjs/config';

@Module({})
export class SwaggerModule {
  static setup(app: INestApplication): DynamicModule {
    const config = app.get(ConfigService);
    const title = config.get<string>('SWAGGER_TITLE', 'Fleet Manager API');
    const description = config.get<string>(
      'SWAGGER_DESCRIPTION',
      'API documentation',
    );
    const version = config.get<string>('SWAGGER_VERSION', '1.0.0');
    const path = config.get<string>('SWAGGER_PATH', '/swagger');
    const postfix = config.get<string>('SWAGGER_POSTFIX', 'Documentation');
    const exportPath = config.get<string>(
      'SWAGGER_EXPORT_PATH',
      'api-collections/fleet-manager',
    );
    const appName = config.get<string>('APP_NAME', 'Fleet Manager');
    const appProtocol = config.get<string>('APP_PROTOCOL', 'http');
    const appHost = config.get<string>('APP_HOST', 'localhost');
    const appPort = config.get<number>('APP_PORT', 3000);

    const options = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version)
      .addServer(`${appProtocol}://${appHost}:${appPort}`)
      .addTag(appName)
      .build();

    const document = NestSwaggerModule.createDocument(app, options);
    const targetDir = join(process.cwd(), exportPath);
    const targetFile = join(targetDir, `${path}.json`);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, JSON.stringify(document, null, 2));

    NestSwaggerModule.setup(path, app, document, {
      customSiteTitle: `${title} ${postfix}`,
    });

    return {
      module: SwaggerModule,
    };
  }
}
