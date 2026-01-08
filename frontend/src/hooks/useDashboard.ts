import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

export const useGetLogs = (petId: string | undefined, startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['logs', petId, startDate, endDate],
    queryFn: async () => {
      if (!petId) return [];
      const response = await apiClient.get(`/logs/pet/${petId}`, {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        },
      });
      return response.data;
    },
    enabled: !!petId,
  });
};

export const useGetWeeklyStats = (petId: string | undefined) => {
  return useQuery({
    queryKey: ['weeklyStats', petId],
    queryFn: async () => {
      if (!petId) return {};
      const response = await apiClient.get(`/logs/pet/${petId}/weekly-stats`);
      return response.data;
    },
    enabled: !!petId,
  });
};
