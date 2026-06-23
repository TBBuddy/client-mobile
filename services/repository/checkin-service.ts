import { apiClient } from './api-client';
import type { CreateCheckinRequest, MessageResponse, RepositoryRequestOptions } from './types';
import { uuidV4 } from './uuid';

export class CheckinService {
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
