import { isAxiosError, isCancel } from 'axios';

import type { ApiErrorResponse } from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorResponse['errors'];
  readonly requestId?: string;

  constructor({
    message,
    status = 0,
    code = 'UNKNOWN_ERROR',
    details = null,
    requestId,
  }: {
    message: string;
    status?: number;
    code?: string;
    details?: ApiErrorResponse['errors'];
    requestId?: string;
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (isCancel(error)) {
      return new ApiError({
        message: 'Permintaan dibatalkan.',
        code: 'REQUEST_CANCELLED',
      });
    }

    if (isAxiosError<ApiErrorResponse>(error)) {
      const payload = error.response?.data;

      return new ApiError({
        message:
          payload?.message ??
          (error.response
            ? 'Permintaan ke server gagal.'
            : 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'),
        status: error.response?.status ?? 0,
        code: payload?.code ?? (error.response ? 'HTTP_ERROR' : 'NETWORK_ERROR'),
        details: payload?.errors ?? null,
        requestId: payload?.requestId,
      });
    }

    return new ApiError({
      message: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.',
    });
  }
}
