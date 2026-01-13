import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useGetPosts, useCreatePost } from '@/hooks/usePost';

// Mock the API client
jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('usePost Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useCreatePost', () => {
    it('should be defined', () => {
      expect(useCreatePost).toBeDefined();
    });

    it('should return a mutation hook with expected properties', () => {
      const { result } = renderHook(() => useCreatePost(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.isPending).toBeDefined();
    });

    it('should have isLoading property', () => {
      const { result } = renderHook(() => useCreatePost(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isPending).toBe('boolean');
    });
  });

  describe('Hook structure', () => {
    it('should export useGetPosts', () => {
      expect(useGetPosts).toBeDefined();
      expect(typeof useGetPosts).toBe('function');
    });

    it('should export useCreatePost', () => {
      expect(useCreatePost).toBeDefined();
      expect(typeof useCreatePost).toBe('function');
    });
  });
});
