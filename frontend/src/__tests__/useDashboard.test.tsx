import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useGetLogs, useGetWeeklyStats } from '@/hooks/useDashboard';

// Mock the API client
jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
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

describe('useDashboard Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useGetLogs', () => {
    it('should be defined', () => {
      expect(useGetLogs).toBeDefined();
    });

    it('should return a query hook', () => {
      const { result } = renderHook(() => useGetLogs('pet-123'), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
      expect(result.current.isError).toBeDefined();
    });

    it('should disable query when petId is undefined', () => {
      const { result } = renderHook(() => useGetLogs(undefined), {
        wrapper: createWrapper(),
      });

      // When disabled, data should be undefined
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should accept optional date range parameters', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const { result } = renderHook(
        () => useGetLogs('pet-123', startDate, endDate),
        {
          wrapper: createWrapper(),
        }
      );

      expect(result.current).toBeDefined();
    });
  });

  describe('useGetWeeklyStats', () => {
    it('should be defined', () => {
      expect(useGetWeeklyStats).toBeDefined();
    });

    it('should return a query hook', () => {
      const { result } = renderHook(() => useGetWeeklyStats('pet-123'), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
      expect(result.current.isError).toBeDefined();
    });

    it('should disable query when petId is undefined', () => {
      const { result } = renderHook(() => useGetWeeklyStats(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });
});
