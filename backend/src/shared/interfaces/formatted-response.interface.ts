export interface IFormattedResponse {
  success?: boolean;
  code?: number;
  message?: string;
  data?: any;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
  };
  details?: any;
}
