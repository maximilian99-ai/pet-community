import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { Post } from '@/types';

export const useGetPosts = (limit: number = 10, offset: number = 0) => {
  return useQuery({
    queryKey: ['posts', limit, offset],
    queryFn: async () => {
      const response = await apiClient.get('/posts', {
        params: { limit, offset },
      });
      return response.data;
    },
  });
};

export const useGetPost = (postId: string | undefined) => {
  return useQuery({
    queryKey: ['posts', postId],
    queryFn: async () => {
      if (!postId) return null;
      const response = await apiClient.get(`/posts/${postId}`);
      return response.data;
    },
    enabled: !!postId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Post>) => {
      const response = await apiClient.post('/posts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error creating post:', error);
    }
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, ...data }: Record<string, unknown> & { postId?: string }) => {
      const response = await apiClient.put(`/posts/${postId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error updating post:', error);
    }
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await apiClient.delete(`/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error deleting post:', error);
    }
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await apiClient.post(`/posts/${postId}/comments`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
    }
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, commentId, content }: { postId: string; commentId: string; content: string }) => {
      const response = await apiClient.put(`/posts/${postId}/comments/${commentId}`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error updating comment:', error);
    }
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiClient.post(`/posts/${postId}/likes`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error liking post:', error);
    }
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, commentId }: { postId: string; commentId: string }) => {
      await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
    }
  });
};
