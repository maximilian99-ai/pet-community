import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useGetProfile, useUpdateProfile, useGetPets, useAddPet } from '@/hooks/useProfile';

// Mock the API client
jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
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

describe('useProfile Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useGetProfile', () => {
    it('should be defined', () => {
      expect(useGetProfile).toBeDefined();
    });

    it('should return a query hook', () => {
      const { result } = renderHook(() => useGetProfile('user-123'), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
    });

    it('should disable when userId is undefined', () => {
      const { result } = renderHook(() => useGetProfile(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useUpdateProfile', () => {
    it('should be defined', () => {
      expect(useUpdateProfile).toBeDefined();
    });

    it('should return a mutation hook', () => {
      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.isPending).toBeDefined();
    });
  });

  describe('useGetPets', () => {
    it('should be defined', () => {
      expect(useGetPets).toBeDefined();
    });

    it('should return a query hook', () => {
      const { result } = renderHook(() => useGetPets('user-123'), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
    });

    it('should be disabled when userId is undefined', () => {
      const { result } = renderHook(() => useGetPets(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useAddPet', () => {
    it('should be defined', () => {
      expect(useAddPet).toBeDefined();
    });

    it('should return a mutation hook', () => {
      const { result } = renderHook(() => useAddPet(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.isPending).toBeDefined();
    });
  });
});
