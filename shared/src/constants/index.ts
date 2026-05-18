// ==============================
// API Configuration
// ==============================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
                            process.env.EXPO_PUBLIC_API_URL || 
                            'http://localhost:5001/api';

// ==============================
// API Endpoints
// ==============================

export const API_ENDPOINTS = {
  // Auth
  AUTH_SIGNUP: '/auth/signup',
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  AUTH_DELETE: '/auth/me',
  
  // Posts
  POSTS: '/posts',
  POST_DETAIL: (postId: string) => `/posts/${postId}`,
  POST_COMMENTS: (postId: string) => `/posts/${postId}/comments`,
  POST_LIKES: (postId: string) => `/posts/${postId}/likes`,
  POST_COMMENT: (postId: string, commentId: string) => 
    `/posts/${postId}/comments/${commentId}`,
  
  // Profile
  PROFILE: (userId: string) => `/profiles/${userId}`,
  PROFILE_ME: '/profiles/me',
  PROFILE_PETS: (userId: string) => `/profiles/${userId}/pets`,
  PROFILE_ME_PETS: '/profiles/me/pets',
  PROFILE_PET: (petId: string) => `/profiles/me/pets/${petId}`,
  
  // Follows
  FOLLOW: (userId: string) => `/follows/${userId}`,
  FOLLOWERS: (userId: string) => `/follows/${userId}/followers`,
  FOLLOWING: (userId: string) => `/follows/${userId}/following`,
  
  // Logs
  LOGS: '/logs',
  LOG_DETAIL: (logId: string) => `/logs/${logId}`,
  
  // Recommendations
  RECOMMENDATIONS: '/recommendations',
} as const;

// ==============================
// App Constants
// ==============================

export const APP_NAME = 'Pet Community';

export const DEFAULT_PAGINATION = {
  LIMIT: 10,
  OFFSET: 0,
} as const;

export const LOG_TYPES = [
  'feeding',
  'walk',
  'health',
  'play',
  'other',
] as const;

export const SUPPORTED_LOCALES = [
  'en',
  'ko',
  'fr',
  'de',
  'es',
  'nl',
  'da',
] as const;

// ==============================
// Storage Keys
// ==============================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_DATA: 'user',
  LOCALE: 'locale',
  THEME: 'theme',
} as const;
