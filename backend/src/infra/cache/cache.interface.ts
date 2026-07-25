export interface ICacheOptions {
  ttl?: number;
  prefix?: string;
}

export interface ICacheService {
  getAsync<T>(key: string): Promise<T>;

  getStatus(): string;

  setAsync(key: string, value: string, ttl?: number): Promise<void>;

  deleteAsync(key: string): Promise<void>;
}
