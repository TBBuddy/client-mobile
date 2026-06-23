import { apiClient } from './api-client';
import type { DataResponse, RepositoryRequestOptions, Symptom } from './types';

export class SymptomService {
  static async listSymptoms(
    options: RepositoryRequestOptions = {},
  ): Promise<Symptom[]> {
    const response = await apiClient.get<DataResponse<Symptom[]>>('/symptoms', {
      signal: options.signal,
    });
    return response.data.data;
  }
}
