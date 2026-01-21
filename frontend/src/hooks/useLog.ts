import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { Log } from '@/types';

export const useGetLogs = (petId: string | undefined) => {
  return useQuery({
    queryKey: ['logs', petId],
    queryFn: async () => {
      if (!petId) return [];
      const response = await apiClient.get(`/logs/pet/${petId}`);
      return response.data;
    },
    enabled: !!petId,
  });
};

export const useCreateLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Log>) => {
      const response = await apiClient.post('/logs', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['logs', data.petId] });
    },
    onError: (error) => {
      console.error('Error creating log:', error);
    },
  });
};

export const useUpdateLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ logId, ...data }: Record<string, unknown> & { logId?: string }) => {
      const response = await apiClient.put(`/logs/${logId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
    onError: (error) => {
      console.error('Error updating log:', error);
    },
  });
};

export const useDeleteLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      await apiClient.delete(`/logs/${logId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
    onError: (error) => {
      console.error('Error deleting log:', error);
    },
  });
};
