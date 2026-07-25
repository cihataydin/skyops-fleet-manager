import { ConfigService } from '@nestjs/config';
import { Logger, createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export function createWinstonLogger(config: ConfigService): Logger {
  const level = config.get<string>('LOG_LEVEL', 'error');
  const enableFileLogging = config.get<boolean>(
    'LOG_ENABLE_FILE_LOGGING',
    false,
  );
  const logDir = config.get<string>('LOG_DIR', './logs');
  const maxFiles = config.get<string>('LOG_MAX_FILES', '14d');
  const maxSize = config.get<string>('LOG_MAX_SIZE', '20m');
  const datePattern = config.get<string>('LOG_DATE_PATTERN', 'YYYY-MM-DD');
  const combined = config.get<boolean>('LOG_FILE_COMBINED', true);
  const error = config.get<boolean>('LOG_FILE_ERROR', true);
  const access = config.get<boolean>('LOG_FILE_ACCESS', true);

  const logFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  );

  const consoleFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, context, ...meta }) => {
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `[${context}][${level}] - ${timestamp} - ${message}${metaStr ? ` : ${metaStr}` : ''}`;
    }),
    format.colorize({
      all: true,
      colors: {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        debug: 'green',
      },
    }),
  );

  const transportsList: any[] = [
    new transports.Console({
      format: consoleFormat,
      level,
    }),
  ];

  if (enableFileLogging) {
    const fileTransport = new DailyRotateFile({
      dirname: logDir,
      filename: '%DATE%-combined.log',
      datePattern: datePattern,
      maxFiles: maxFiles,
      maxSize: maxSize,
      format: logFormat,
      level: level,
    });

    const errorTransport = new DailyRotateFile({
      dirname: logDir,
      filename: '%DATE%-error.log',
      datePattern: datePattern,
      maxFiles: maxFiles,
      maxSize: maxSize,
      format: logFormat,
      level: 'error',
    });

    const accessTransport = new DailyRotateFile({
      dirname: logDir,
      filename: '%DATE%-access.log',
      datePattern: datePattern,
      maxFiles: maxFiles,
      maxSize: maxSize,
      format: logFormat,
      level: 'info',
    });

    if (combined) {
      transportsList.push(fileTransport);
    }
    if (error) {
      transportsList.push(errorTransport);
    }
    if (access) {
      transportsList.push(accessTransport);
    }
  }

  return createLogger({
    level,
    format: logFormat,
    transports: transportsList,
  });
}
