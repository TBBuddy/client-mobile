import { create } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { ApiError } from './api-error';
import { TokenStorage } from './token-storage';

const DEFAULT_API_URL = 'https://dev-api-tbuddy.taulikha.site/api/v1';

export const apiClient: AxiosInstance = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const accessToken = await TokenStorage.getAccessToken();

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(ApiError.from(error)),
);
