import { apiClient } from './api-client';
import { TokenStorage } from './token-storage';
import type {
  AuthSessionUser,
  DataResponse,
  LoginData,
  LoginRequest,
  LogoutRequest,
  MessageResponse,
  RegisterRequest,
  RepositoryRequestOptions,
} from './types';

export class AuthService {
  static async register(
    payload: RegisterRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>('/auth/register', payload, {
      signal: options.signal,
    });
    return response.data;
  }

  static async login(
    payload: LoginRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<LoginData> {
    const response = await apiClient.post<DataResponse<LoginData>>('/auth/login', payload, {
      signal: options.signal,
    });
    await TokenStorage.setAccessToken(response.data.data.accessToken);
    return response.data.data;
  }

  static async me(options: RepositoryRequestOptions = {}): Promise<AuthSessionUser> {
    const response = await apiClient.get<DataResponse<AuthSessionUser>>('/auth/me', {
      signal: options.signal,
    });
    return response.data.data;
  }

  static async logout(
    payload: LogoutRequest = {},
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    try {
      const response = await apiClient.post<MessageResponse>('/auth/logout', payload, {
        signal: options.signal,
      });
      return response.data;
    } finally {
      await TokenStorage.clearAccessToken();
    }
  }
}
