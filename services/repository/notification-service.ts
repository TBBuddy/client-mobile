import { apiClient } from './api-client';
import type {
  MessageResponse,
  NotificationListItem,
  PaginatedResponse,
  RepositoryRequestOptions,
} from './types';

export type GetNotificationsParams = {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
};

export class NotificationService {
  static async getNotifications(
    params: GetNotificationsParams = {},
    options: RepositoryRequestOptions = {},
  ): Promise<PaginatedResponse<NotificationListItem>> {
    const response = await apiClient.get<PaginatedResponse<NotificationListItem>>(
      '/notifications',
      {
        params,
        signal: options.signal,
      },
    );
    return response.data;
  }

  static async getUnreadCount(
    options: RepositoryRequestOptions = {},
  ): Promise<number> {
    const response = await apiClient.get<{ unreadCount: number }>(
      '/notifications/unread-count',
      {
        signal: options.signal,
      },
    );
    return response.data.unreadCount;
  }

  static async markAsRead(
    notificationId: string,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.patch<MessageResponse>(
      `/notifications/${encodeURIComponent(notificationId)}/read`,
      {},
      {
        signal: options.signal,
      },
    );
    return response.data;
  }

  static async markAllAsRead(
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.patch<MessageResponse>(
      '/notifications/read-all',
      {},
      {
        signal: options.signal,
      },
    );
    return response.data;
  }
}
