import { apiClient } from './api-client';
import type {
  CreateCheckinRequest,
  DailyCheckin,
  GetCheckinsParams,
  MessageResponse,
  PaginatedResponse,
  RepositoryRequestOptions,
} from './types';
import { uuidV4 } from './uuid';

export class CheckinService {
  static async getCheckins(
    params: GetCheckinsParams = {},
    options: RepositoryRequestOptions = {},
  ): Promise<PaginatedResponse<DailyCheckin>> {
    const response = await apiClient.get<PaginatedResponse<DailyCheckin>>(
      '/checkins',
      { params, signal: options.signal },
    );
    return response.data;
  }

  static async getCheckinById(
    id: string,
    options: RepositoryRequestOptions = {},
  ): Promise<DailyCheckin> {
    const response = await apiClient.get<{ data: DailyCheckin }>(
      `/checkins/${id}`,
      { signal: options.signal },
    );
    return response.data.data;
  }

  static async createCheckin(
    payload: CreateCheckinRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      '/checkins',
      payload,
      {
        signal: options.signal,
        headers: { 'Idempotency-Key': uuidV4() },
      },
    );
    return response.data;
  }
}
