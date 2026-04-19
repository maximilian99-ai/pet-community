'use client';

import { useTranslations } from 'next-intl';
import { useColorMode, Box, VStack, Card, CardBody, Heading, Text, Button, HStack, Avatar, Divider, Flex, useDisclosure, Input, useToast, Badge } from '@chakra-ui/react';
import { useAuthStore } from '@/store';
import { useAddComment, useLikePost, useDeleteComment, useDeletePost } from '@/hooks/usePost';
import { Post } from '@/types';
import { useState, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import apiClient from '@/api/client';
import NextImage from 'next/image';
import dynamic from 'next/dynamic';

const PostModal = dynamic(() => import('./PostModal'), {
  loading: () => <Text>Loading...</Text>,
});

interface FeedClientProps {
  initialPosts: Post[];
  sharedPostId?: string | null;
}

export default function FeedClient({ initialPosts, sharedPostId }: FeedClientProps) {
  const t = useTranslations();
  const { colorMode } = useColorMode();
  const auth = useAuthStore(state => state.isAuthenticated);
  const currentUserId = useAuthStore(state => state.username);
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();
  const likePostMutation = useLikePost();
  const deletePostMutation = useDeletePost();
  const toast = useToast();
  
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [postData, setPostData] = useState({ title: '', content: '', image: '' });
  const [commentData, setCommentData] = useState<{ [key: string]: string }>({});
  const [editingComment, setEditingComment] = useState<{ [key: string]: string }>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editPostData, setEditPostData] = useState({ title: '', content: '' });
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [fullPostData, setFullPostData] = useState<{ [key: string]: Post }>({});
  const createPostDisclosure = useDisclosure();
  const editPostDisclosure = useDisclosure();

  const popularPosts = useMemo(
    () => [...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0)).slice(0, 3),
    [posts]
  );

  const pathname = usePathname();
  const locale = useMemo(() => pathname.split('/')[1], [pathname]);
  
  const router = useRouter();
  
  const displayPosts = useMemo(
    () => sharedPostId 
      ? posts.filter(post => post.id === sharedPostId)
      : posts,
    [sharedPostId, posts]
  );

  const handleCreatePost = useCallback(() => {
    setPostData({ title: '', content: '', image: '' });
    createPostDisclosure.onOpen();
  }, [createPostDisclosure]);

  const handleEditPost = (post: Post) => {
    setEditingPost(post.id);
    setEditPostData({ title: post.title, content: post.content });
    editPostDisclosure.onOpen();
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostMutation.mutateAsync(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    try {
      const content = commentData[postId];
      if (!content || !content.trim()) return;
      
      await addCommentMutation.mutateAsync({ postId, content });
      setCommentData({ ...commentData, [postId]: '' });
      
      if (expandedComments.has(postId)) {
        const response = await apiClient.get(`/posts/${postId}`);
        setFullPostData({ ...fullPostData, [postId]: response.data });
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleEditComment = (postId: string, commentId: string, content: string) => {
    setEditingComment({ postId, commentId, content });
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync({ postId, commentId });
      
      if (expandedComments.has(postId)) {
        const response = await apiClient.get(`/posts/${postId}`);
        setFullPostData({ ...fullPostData, [postId]: response.data });
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!auth) {
      return;
    }
    
    try {
      await likePostMutation.mutateAsync(postId);
      
      const newLikedPosts = new Set(likedPosts);
      if (newLikedPosts.has(postId)) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }
      setLikedPosts(newLikedPosts);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleSharePost = (postId: string) => {
    const postUrl = `${window.location.origin}/${locale}/feed?postId=${postId}`;
    navigator.clipboard.writeText(postUrl);
    toast({
      title: 'Copied to clipboard',
      description: 'Post link has been copied to your clipboard.',
      status: 'success',
      duration: 3000
    });
  };

  const handleExpandComments = async (postId: string) => {
    try {
      if (expandedComments.has(postId)) {
        const newExpanded = new Set(expandedComments);
        newExpanded.delete(postId);
        setExpandedComments(newExpanded);
        return;
      }

      const response = await apiClient.get(`/posts/${postId}`);
      const fullPost = response.data;
      setFullPostData({ ...fullPostData, [postId]: fullPost });
      const newExpanded = new Set(expandedComments);
      newExpanded.add(postId);
      setExpandedComments(newExpanded);
    } catch (error) {
      console.error('Failed to load all comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load all comments',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Box>
      <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'} p={{ base: 4, md: 8 }}>
        <VStack spacing={6} maxW="800px" mx="auto">
          <Heading>{t('feed.title')}</Heading>

          {auth ? (
            <Card width="100%" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
              <CardBody>
                <Text>{t('feed.newPost')}</Text>
                <Button colorScheme="blue" mt={4} onClick={handleCreatePost}>
                  {t('feed.post')}
                </Button>
              </CardBody>
            </Card>
          ) : null}

          <VStack spacing={4} width="100%">
            {popularPosts.length > 0 && !sharedPostId && (
              <Card width="100%" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
                <CardBody>
                  <Flex align="center" justify="space-between" mb={3}>
                    <Heading size="sm">{t('feed.bestPost')}</Heading>
                    <Badge bg="orange.600" color="white" variant="solid" borderRadius="full"
                      px={2} py={0.5} fontSize="xs">
                      TOP
                    </Badge>
                  </Flex>
                  <VStack spacing={2} align="stretch">
                    {popularPosts.map((post: Post) => (
                      <Box
                        key={post.id}
                        p={3}
                        borderRadius="md"
                        bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'}
                      >
                        <Flex align="center" justify="space-between" gap={3} cursor="pointer" onClick={() => { router.push(`/${locale}/feed?postId=${post.id}`) }}>
                          <Box flex={1} minW={0}>
                            <HStack spacing={2} mb={1}>
                              <Text fontWeight="bold" noOfLines={1}>
                                {post.title}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} noOfLines={1}>
                              {post.author?.username || t('feed.deletedUser')}
                            </Text>
                          </Box>
                          <HStack spacing={2} flexShrink={0}>
                            <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                              ❤️ {post.likesCount || post._count?.likes || 0}
                            </Text>
                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleSharePost(post.id); }}>
                              {t('feed.share')}
                            </Button>
                          </HStack>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}
            {displayPosts.length > 0 ? (
              displayPosts.map((post: Post, index: number) => (
                <Card key={post.id} width="100%" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
                  <CardBody>
                    <Flex mb={4} align="center" justify="space-between">
                      <Flex align="center">
                        <Avatar
                          size="md"
                          name={post.author?.username || t('feed.deletedUser')}
                          src={post.author?.avatar}
                          mr={3}
                        />
                        <Box>
                          <Text fontWeight="bold">{post.author?.username || t('feed.deletedUser')}</Text>
                          <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </Text>
                        </Box>
                      </Flex>
                      {currentUserId && post.author && currentUserId === post.author.username && (
                        <HStack spacing={2}>
                          <Button size="sm" variant="ghost" onClick={() => handleEditPost(post)}>
                            ✏️
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeletePost(post.id)}>
                            🗑️
                          </Button>
                        </HStack>
                      )}
                    </Flex>

                    <Divider mb={4} />

                    <HStack spacing={2} mb={2} align="center">
                      <Heading size="md">{post.title}</Heading>
                    </HStack>
                    <Text mb={4}>{post.content}</Text>

                    {post.image && (
                      <Box mb={4} borderRadius="md" overflow="hidden" position="relative" minH="300px">
                        <NextImage 
                          src={post.image} 
                          alt={post.title} 
                          width={800} 
                          height={600} 
                          style={{ width: '100%', height: 'auto' }}
                          priority={index === 0 && !sharedPostId}
                          quality={85}
                          sizes="(max-width: 800px) 100vw, 800px"
                        />
                      </Box>
                    )}

                    {post.pet && (
                      <Box mb={4} p={3} bg={colorMode === 'dark' ? 'gray.600' : 'gray.100'} borderRadius="md">
                        <Text fontSize="sm" fontWeight="bold">
                          🐾 {post.pet.name} ({post.pet.species}
                          {post.pet.breed ? ` - ${post.pet.breed}` : ''})
                        </Text>
                      </Box>
                    )}

                    {post.badges && post.badges.length > 0 && (
                      <HStack mb={4} spacing={2} flexWrap="wrap">
                        {post.badges.map((badge) => (
                          <Badge key={badge.id} colorScheme="gold" variant="solid">
                            ⭐ {badge.name}
                          </Badge>
                        ))}
                      </HStack>
                    )}

                    <Divider mb={4} />

                    <HStack spacing={4} mb={4}>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleLikePost(post.id)}
                        isLoading={likePostMutation.isPending}
                      >
                        {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likesCount || post._count?.likes || 0}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleExpandComments(post.id)}>
                        💬 {post.commentsCount || post._count?.comments || 0}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleSharePost(post.id)}
                      >
                        🔗 {t('feed.share')}
                      </Button>
                    </HStack>

                    {(post.comments && post.comments.length > 0) || (expandedComments.has(post.id) && fullPostData[post.id]?.comments) ? (
                      <Box mb={4}>
                        <Flex justify="space-between" align="center" mb={2}>
                          <Text fontSize="sm" fontWeight="bold">
                            {t('feed.comments')}
                          </Text>
                          {(post.commentsCount || post._count?.comments || 0) > 3 && (
                            <Button
                              size="xs"
                              variant="link"
                              colorScheme="blue"
                              onClick={() => handleExpandComments(post.id)}
                            >
                              {expandedComments.has(post.id) 
                                ? (t('feed.showLess'))
                                : `${t('feed.viewAllComments')} (${(post.commentsCount || post._count?.comments || 0) - 3})`
                              }
                            </Button>
                          )}
                        </Flex>
                        {(expandedComments.has(post.id) && fullPostData[post.id]?.comments 
                          ? fullPostData[post.id].comments 
                          : post.comments || []
                        ).map((comment) => (
                          <Box key={comment.id} mb={2} p={2} bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'} borderRadius="md">
                            <Flex justify="space-between" align="start">
                              <Box flex={1}>
                                <Flex align="center" mb={1}>
                                  <Text fontSize="sm" fontWeight="bold" mr={2}>
                                    {comment.author?.username || t('feed.deletedUser')}
                                  </Text>
                                  {currentUserId && comment.author && currentUserId === comment.author.username && (
                                    <HStack spacing={1}>
                                      <Button 
                                        size="xs" 
                                        variant="ghost"
                                        onClick={() => handleEditComment(post.id, comment.id, comment.content)}
                                      >
                                        ✏️
                                      </Button>
                                      <Button 
                                        size="xs" 
                                        variant="ghost"
                                        onClick={() => handleDeleteComment(post.id, comment.id)}
                                      >
                                        🗑️
                                      </Button>
                                    </HStack>
                                  )}
                                </Flex>
                                <Text fontSize="sm">{comment.content}</Text>
                              </Box>
                            </Flex>
                          </Box>
                        ))}
                      </Box>
                    ) : null}

                    {auth && (
                      <HStack spacing={2}>
                        <Input
                          size="sm"
                          placeholder={t('feed.comment')}
                          value={commentData[post.id] || ''}
                          onChange={(e) => setCommentData({ ...commentData, [post.id]: e.target.value })}
                        />
                        <Button 
                          size="sm" 
                          colorScheme="blue"
                          onClick={() => handleAddComment(post.id)}
                          isLoading={addCommentMutation.isPending}
                        >
                          {t('feed.post')}
                        </Button>
                      </HStack>
                    )}
                  </CardBody>
                </Card>
              ))
            ) : (
              <Card width="100%" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
                <CardBody>
                  <Text textAlign="center">{t('feed.noPosts')}</Text>
                </CardBody>
              </Card>
            )}
          </VStack>
        </VStack>
      </Box>

      <PostModal
        createPostDisclosure={createPostDisclosure}
        editPostDisclosure={editPostDisclosure}
        postData={postData}
        setPostData={setPostData}
        editingPost={editingPost}
        setEditingPost={setEditingPost}
        editPostData={editPostData}
        setEditPostData={setEditPostData}
        editingComment={editingComment}
        setEditingComment={setEditingComment}
        fullPostData={fullPostData}
        setFullPostData={setFullPostData}
        expandedComments={expandedComments}
      />
    </Box>
  );
}
