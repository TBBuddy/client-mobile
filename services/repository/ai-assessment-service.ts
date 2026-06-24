import { apiClient } from './api-client';
import type {
  AiAssessment,
  AiAssessmentDetail,
  GenerateAiAssessmentResponse,
  RepositoryRequestOptions,
} from './types';

export class AiAssessmentService {
  static async generate(
    options: RepositoryRequestOptions = {},
  ): Promise<GenerateAiAssessmentResponse> {
    const response = await apiClient.post<GenerateAiAssessmentResponse>(
      '/ai-assessments/generate',
      undefined,
      { signal: options.signal },
    );
    return response.data;
  }

  static async listAssessments(
    options: RepositoryRequestOptions = {},
  ): Promise<AiAssessment[]> {
    const response = await apiClient.get<AiAssessment[]>('/ai-assessments', {
      signal: options.signal,
    });
    return response.data;
  }

  static async getLatest(
    options: RepositoryRequestOptions = {},
  ): Promise<AiAssessment | null> {
    const response = await apiClient.get<AiAssessment | null>(
      '/ai-assessments/latest',
      { signal: options.signal },
    );
    return response.data;
  }

  static async getById(
    id: string,
    options: RepositoryRequestOptions = {},
  ): Promise<AiAssessmentDetail> {
    const response = await apiClient.get<AiAssessmentDetail>(
      `/ai-assessments/${encodeURIComponent(id)}`,
      { signal: options.signal },
    );
    return response.data;
  }
}
