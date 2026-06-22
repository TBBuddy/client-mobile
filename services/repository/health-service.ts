import { apiClient } from './api-client';
import type {
  DataResponse,
  HealthData,
  RepositoryRequestOptions,
} from './types';

export class HealthService {
  static async check(options: RepositoryRequestOptions = {}): Promise<HealthData> {
    const response = await apiClient.get<DataResponse<HealthData>>('/health', {
      signal: options.signal,
    });
    return response.data.data;
  }
}
