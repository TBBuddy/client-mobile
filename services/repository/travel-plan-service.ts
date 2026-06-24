import { apiClient } from "./api-client";
import type {
  CreateTravelPlanRequest,
  DataResponse,
  GetTravelPlansParams,
  MessageResponse,
  PaginatedResponse,
  RepositoryRequestOptions,
  TravelPlan,
  UpdateTravelPlanRequest,
} from "./types";

export class TravelPlanService {
  static async listPlans(
    params: GetTravelPlansParams = {},
    options: RepositoryRequestOptions = {},
  ): Promise<PaginatedResponse<TravelPlan>> {
    const response = await apiClient.get<PaginatedResponse<TravelPlan>>(
      "/travel-plans",
      {
        params,
        signal: options.signal,
      },
    );
    return response.data;
  }

  static async getPlan(
    id: string,
    options: RepositoryRequestOptions = {},
  ): Promise<TravelPlan> {
    const response = await apiClient.get<DataResponse<TravelPlan>>(
      `/travel-plans/${encodeURIComponent(id)}`,
      { signal: options.signal },
    );
    return response.data.data;
  }

  static async createPlan(
    payload: CreateTravelPlanRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      "/travel-plans",
      payload,
      { signal: options.signal },
    );
    return response.data;
  }

  static async updatePlan(
    id: string,
    payload: UpdateTravelPlanRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.patch<MessageResponse>(
      `/travel-plans/${encodeURIComponent(id)}`,
      payload,
      { signal: options.signal },
    );
    return response.data;
  }

  static async cancelPlan(
    id: string,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      `/travel-plans/${encodeURIComponent(id)}/cancel`,
      {},
      { signal: options.signal },
    );
    return response.data;
  }
}
