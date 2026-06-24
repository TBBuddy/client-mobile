import { apiClient } from './api-client';
import type {
  CreateForumCommentRequest,
  CreateForumPostRequest,
  ForumComment,
  ForumPost,
  ListForumCommentsParams,
  ListForumPostsParams,
  MessageResponse,
  PaginatedResponse,
  RepositoryRequestOptions,
} from './types';

export class ForumService {
  static async listPosts(
    params: ListForumPostsParams = {},
    options: RepositoryRequestOptions = {},
  ): Promise<PaginatedResponse<ForumPost>> {
    const response = await apiClient.get<PaginatedResponse<ForumPost>>(
      '/forum/posts',
      { params, signal: options.signal },
    );
    return response.data;
  }

  static async getPost(
    id: string,
    options: RepositoryRequestOptions = {},
  ): Promise<ForumPost> {
    const response = await apiClient.get<{ data: ForumPost }>(
      `/forum/posts/${encodeURIComponent(id)}`,
      { signal: options.signal },
    );
    return response.data.data;
  }

  static async createPost(
    payload: CreateForumPostRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      '/forum/posts',
      payload,
      { signal: options.signal },
    );
    return response.data;
  }

  static async listComments(
    postId: string,
    params: ListForumCommentsParams = {},
    options: RepositoryRequestOptions = {},
  ): Promise<PaginatedResponse<ForumComment>> {
    const response = await apiClient.get<PaginatedResponse<ForumComment>>(
      `/forum/posts/${encodeURIComponent(postId)}/comments`,
      { params, signal: options.signal },
    );
    return response.data;
  }

  static async createComment(
    postId: string,
    payload: CreateForumCommentRequest,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      `/forum/posts/${encodeURIComponent(postId)}/comments`,
      payload,
      { signal: options.signal },
    );
    return response.data;
  }

  static async likePost(
    postId: string,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      `/forum/posts/${encodeURIComponent(postId)}/like`,
      undefined,
      { signal: options.signal },
    );
    return response.data;
  }

  static async unlikePost(
    postId: string,
    options: RepositoryRequestOptions = {},
  ): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(
      `/forum/posts/${encodeURIComponent(postId)}/like`,
      { signal: options.signal },
    );
    return response.data;
  }
}
