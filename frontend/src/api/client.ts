import axios from 'axios';

// 배포 환경에서는 반드시 NEXT_PUBLIC_API_URL을 설정해야 함
// Vercel: https://your-backend-url.vercel.app/api (또는 Railway URL)
// 로컬: http://localhost:5001/api (기본값)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ NEXT_PUBLIC_API_URL is not set! API calls will fail in production.');
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 로그인/회원가입 요청에서는 자동 리다이렉트하지 않음
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                            error.config?.url?.includes('/auth/signup');
      
      if (!isAuthEndpoint && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // locale을 포함한 경로로 리다이렉트
        const locale = window.location.pathname.split('/')[1] || 'ko';
        window.location.href = `/${locale}/login`;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
