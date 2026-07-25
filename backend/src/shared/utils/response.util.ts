import { IFormattedResponse } from '@/shared/interfaces';

export const formatResponse = (
  data?: any,
  pagination?: any,
): IFormattedResponse => ({
  data,
  pagination,
});
