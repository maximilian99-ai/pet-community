'use client';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30초 동안 데이터를 fresh로 간주
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
      refetchOnMount: false, // 컴포넌트 마운트 시 자동 refetch 비활성화
      retry: 1, // 실패 시 재시도 횟수 줄이기
    },
    mutations: {
      retry: 0, // mutation은 재시도 안 함
    },
  },
});

export function ReactQueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
