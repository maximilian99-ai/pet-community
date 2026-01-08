import apiClient from './client';
import { User, Pet, Post, Log, AuthResponse } from '@/types';

// Auth API
export const authAPI = {
  signup: (data: { email: string; username: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data),
  getCurrentUser: () => apiClient.get<User>('/auth/me'),
};

// Profile API
export const profileAPI = {
  getProfile: (userId: string) => apiClient.get<User>(`/profiles/${userId}`),
  updateProfile: (data: Partial<User>) => apiClient.put<User>('/profiles/me', data),
  getPets: (userId: string) => apiClient.get<Pet[]>(`/profiles/${userId}/pets`),
  addPet: (data: Partial<Pet>) => apiClient.post<Pet>('/profiles/me/pets', data),
  updatePet: (petId: string, data: Partial<Pet>) =>
    apiClient.put<Pet>(`/profiles/me/pets/${petId}`, data),
  deletePet: (petId: string) => apiClient.delete(`/profiles/me/pets/${petId}`),
};

// Post API
export const postAPI = {
  getPosts: (limit: number = 10, offset: number = 0) =>
    apiClient.get<{ posts: Post[]; total: number }>('/posts', {
      params: { limit, offset },
    }),
  getPost: (postId: string) => apiClient.get<Post>(`/posts/${postId}`),
  createPost: (data: Partial<Post>) => apiClient.post<Post>('/posts', data),
  updatePost: (postId: string, data: Partial<Post>) =>
    apiClient.put<Post>(`/posts/${postId}`, data),
  deletePost: (postId: string) => apiClient.delete(`/posts/${postId}`),
  addComment: (postId: string, content: string) =>
    apiClient.post(`/posts/${postId}/comments`, { content }),
  likePost: (postId: string) => apiClient.post(`/posts/${postId}/likes`),
};

// Log API
export const logAPI = {
  getLogs: (petId: string, startDate?: Date, endDate?: Date) =>
    apiClient.get<Log[]>(`/logs/pet/${petId}`, {
      params: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    }),
  createLog: (data: Partial<Log>) => apiClient.post<Log>('/logs', data),
  updateLog: (logId: string, data: Partial<Log>) =>
    apiClient.put<Log>(`/logs/${logId}`, data),
  deleteLog: (logId: string) => apiClient.delete(`/logs/${logId}`),
  getWeeklyStats: (petId: string) =>
    apiClient.get<Record<string, number>>(`/logs/pet/${petId}/weekly-stats`),
};

// Recommendations API
export const recommendationsAPI = {
  getPosts: (limit: number = 10) =>
    apiClient.get<Post[]>('/recommendations', { params: { limit } }),
  getBestPosts: (limit: number = 10) =>
    apiClient.get<Post[]>('/recommendations/best', { params: { limit } }),
  getUsers: (limit: number = 10) =>
    apiClient.get('/recommendations/users', { params: { limit } }),
};

export default {
  auth: authAPI,
  profile: profileAPI,
  post: postAPI,
  log: logAPI,
  recommendations: recommendationsAPI,
};
