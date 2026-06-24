import { apiClient } from './api-client';
import type {
  CreateMedicineStockRequest,
  DataResponse,
  ListMedicineStocksParams,
  MedicineStock,
  MessageResponse,
  PaginatedResponse,
  RepositoryRequestOptions,
  RestockMedicineRequest,
  UpdateMedicineStockRequest,
} from './types';
import { uuidV4 } from './uuid';

export class MedicineStockService {
  static async listStocks(
    params: ListMedicineStocksParams = {},
    options: RepositoryRequestOptions = {},
  ): Promise<PaginatedResponse<MedicineStock>> {
    const response = await apiClient.get<PaginatedResponse<MedicineStock>>(
      '/medicine-stocks',
      { params, signal: options.signal },
    );
    return response.data;
  }

  static async updateStatus(
    id: string,
    isActive: boolean,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.patch<MessageResponse>(
      `/medicine-stocks/${encodeURIComponent(id)}/status`,
      { isActive },
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
