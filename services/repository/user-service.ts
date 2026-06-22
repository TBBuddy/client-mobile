import { apiClient } from './api-client';
import type {
  MessageResponse,
  PushTokenRequest,
  RepositoryRequestOptions,
  UpdateUserProfileRequest,
} from './types';

export class UserService {
  static async updateProfile(
    payload: UpdateUserProfileRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.patch<MessageResponse>('/users/me', payload, {
      signal: options.signal,
    });
    return response.data;
  }

  static async addPushToken(
    payload: PushTokenRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>('/users/me/push-tokens', payload, {
      signal: options.signal,
    });
    return response.data;
  }

  static async removePushToken(
    payload: PushTokenRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>('/users/me/push-tokens', {
      data: payload,
      signal: options.signal,
    });
    return response.data;
  }
}
