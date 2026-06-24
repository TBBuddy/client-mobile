import { apiClient } from "./api-client";
import type {
  DataResponse,
  FacilityDetail,
  GetFacilitiesParams,
  GetNearbyParams,
  HealthFacilitySummary,
  NearbyFacility,
  PaginatedResponse,
  RepositoryRequestOptions,
} from "./types";

export class FacilityService {
  static async getFacilities(
    params: GetFacilitiesParams = {},
    options: RepositoryRequestOptions = {},
  ): Promise<PaginatedResponse<HealthFacilitySummary>> {
    const response = await apiClient.get<
      PaginatedResponse<HealthFacilitySummary>
    >("/facilities", { params, signal: options.signal });
    return response.data;
  }

  static async getNearby(
    params: GetNearbyParams,
    options: RepositoryRequestOptions = {},
  ): Promise<NearbyFacility[]> {
    const response = await apiClient.get<DataResponse<NearbyFacility[]>>(
      "/facilities/nearby",
      { params, signal: options.signal },
    );
    return response.data.data;
  }

  static async getById(
    id: string,
    options: RepositoryRequestOptions = {},
  ): Promise<FacilityDetail> {
    const response = await apiClient.get<DataResponse<FacilityDetail>>(
      `/facilities/${encodeURIComponent(id)}`,
      { signal: options.signal },
    );
    return response.data.data;
  }
}
