export interface ILoggerService {
  setContext(scope: string): void;
  log(message: string, meta?: Record<string, any>): void;
  info(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>, trace?: string): void;
  warn(message: string, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
}
