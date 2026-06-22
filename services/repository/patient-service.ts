import { apiClient } from './api-client';
import type {
  CreatePmoRequest,
  DataResponse,
  MessageResponse,
  PatientDashboard,
  PatientOnboardingRequest,
  PatientPmo,
  PatientProfile,
  RepositoryRequestOptions,
  UpdatePatientProfileRequest,
  UpdatePmoRequest,
} from './types';

export class PatientService {
  static async onboarding(
    payload: PatientOnboardingRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>('/patients/me/onboarding', payload, {
      signal: options.signal,
    });
    return response.data;
  }

  static async getProfile(options: RepositoryRequestOptions = {}): Promise<PatientProfile> {
    const response = await apiClient.get<DataResponse<PatientProfile>>('/patients/me/profile', {
      signal: options.signal,
    });
    return response.data.data;
  }

  static async updateProfile(
    payload: UpdatePatientProfileRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.patch<MessageResponse>('/patients/me/profile', payload, {
      signal: options.signal,
    });
    return response.data;
  }

  static async getDashboard(
    options: RepositoryRequestOptions = {},
  ): Promise<PatientDashboard> {
    const response = await apiClient.get<DataResponse<PatientDashboard>>('/patients/me/dashboard', {
      signal: options.signal,
    });
    return response.data.data;
  }

  static async listPmos(options: RepositoryRequestOptions = {}): Promise<PatientPmo[]> {
    const response = await apiClient.get<DataResponse<PatientPmo[]>>('/patients/me/pmos', {
      signal: options.signal,
    });
    return response.data.data;
  }

  static async createPmo(
    payload: CreatePmoRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>('/patients/me/pmos', payload, {
      signal: options.signal,
    });
    return response.data;
  }

  static async updatePmo(
    id: string,
    payload: UpdatePmoRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.patch<MessageResponse>(
      `/patients/me/pmos/${encodeURIComponent(id)}`,
      payload,
      { signal: options.signal },
    );
    return response.data;
  }

  static async deactivatePmo(
    id: string,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(
      `/patients/me/pmos/${encodeURIComponent(id)}`,
      { signal: options.signal },
    );
    return response.data;
  }
}
