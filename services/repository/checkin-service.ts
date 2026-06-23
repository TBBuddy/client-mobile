import { apiClient } from './api-client';
import type { CreateCheckinRequest, MessageResponse, RepositoryRequestOptions } from './types';

export class CheckinService {
  static async createCheckin(
    payload: CreateCheckinRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      '/checkins',
      payload,
      { signal: options.signal },
    );
    return response.data;
  }
}
