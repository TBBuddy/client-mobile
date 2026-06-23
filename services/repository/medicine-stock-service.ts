import { apiClient } from './api-client';
import type {
  CreateMedicineStockRequest,
  DataResponse,
  MedicineStock,
  MessageResponse,
  PaginatedResponse,
  RepositoryRequestOptions,
  RestockMedicineRequest,
  UpdateMedicineStockRequest,
} from './types';

function uuidV4(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return [
    bytes.slice(0, 4),
    bytes.slice(4, 6),
    bytes.slice(6, 8),
    bytes.slice(8, 10),
    bytes.slice(10, 16),
  ]
    .map((seg) =>
      Array.from(seg)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
    )
    .join('-');
}

export class MedicineStockService {
  static async listStocks(
    options: RepositoryRequestOptions = {},
  ): Promise<PaginatedResponse<MedicineStock>> {
    const response = await apiClient.get<PaginatedResponse<MedicineStock>>(
      '/medicine-stocks',
      { signal: options.signal },
    );
    return response.data;
  }

  static async createStock(
    payload: CreateMedicineStockRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      '/medicine-stocks',
      payload,
      { signal: options.signal },
    );
    return response.data;
  }

  static async updateStock(
    id: string,
    payload: UpdateMedicineStockRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.patch<MessageResponse>(
      `/medicine-stocks/${encodeURIComponent(id)}`,
      payload,
      { signal: options.signal },
    );
    return response.data;
  }

  static async restock(
    id: string,
    payload: RestockMedicineRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      `/medicine-stocks/${encodeURIComponent(id)}/restock`,
      payload,
      {
        signal: options.signal,
        headers: { 'Idempotency-Key': uuidV4() },
      },
    );
    return response.data;
  }

  static async getStock(
    id: string,
    options: RepositoryRequestOptions = {},
  ): Promise<MedicineStock> {
    const response = await apiClient.get<DataResponse<MedicineStock>>(
      `/medicine-stocks/${encodeURIComponent(id)}`,
      { signal: options.signal },
    );
    return response.data.data;
  }
}
