import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';

export interface UserWithFollows {
  id: string;
  username: string;
  avatar?: string;
  email: string;
  bio?: string;
  followers: number;
  following: number;
  createdAt: string;
}

export const useGetUserFollows = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userFollows', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiClient.get(`/profiles/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.post(`/follows/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFollows'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Error following user:', error);
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.delete(`/follows/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFollows'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Error unfollowing user:', error);
    },
  });
};

export const useGetFollowingUsers = (userId: string | undefined, limit: number = 10) => {
  return useQuery({
    queryKey: ['followingUsers', userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiClient.get(`/follows/${userId}/following`, {
        params: { limit },
      });
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useGetFollowers = (userId: string | undefined, limit: number = 10) => {
  return useQuery({
    queryKey: ['followers', userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiClient.get(`/follows/${userId}/followers`, {
        params: { limit },
      });
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useIsFollowing = (userId: string | undefined, targetUserId: string | undefined) => {
  return useQuery({
    queryKey: ['isFollowing', userId, targetUserId],
    queryFn: async () => {
      if (!userId || !targetUserId) return false;
      const response = await apiClient.get(`/follows/${userId}/check/${targetUserId}`);
      return response.data.isFollowing;
    },
    enabled: !!userId && !!targetUserId,
  });
};
