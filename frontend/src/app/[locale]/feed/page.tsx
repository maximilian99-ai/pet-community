'use client';

import { useTranslations } from 'next-intl';
import { useColorMode, Box, VStack, Card, CardBody, Heading, Text, Button, HStack, Avatar, Divider, Flex, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Textarea, Image, useToast, Badge } from '@chakra-ui/react';
import { useAuthStore } from '@/store';
import { useGetPosts } from '@/hooks/usePost';
import { useCreatePost, useAddComment, useLikePost, useDeleteComment, useUpdateComment, useUpdatePost, useDeletePost } from '@/hooks/usePost';
import { Post } from '@/types';
import { useState, useRef, useMemo, useCallback } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import apiClient from '@/api/client';
import NextImage from 'next/image';

export const dynamic = 'force-dynamic';

export default function FeedPage() {
  const t = useTranslations();
  const { colorMode } = useColorMode();
  const auth = useAuthStore(state => state.isAuthenticated);
  const currentUserId = useAuthStore(state => state.username);
  const { data: feedData, isLoading } = useGetPosts(10, 0);
  const createPostMutation = useCreatePost();
  const addCommentMutation = useAddComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const likePostMutation = useLikePost();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();
  const toast = useToast();
  
  const [postData, setPostData] = useState({ title: '', content: '', image: '' });
  const [commentData, setCommentData] = useState<{ [key: string]: string }>({});
  const [editingComment, setEditingComment] = useState<{ [key: string]: string }>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editPostData, setEditPostData] = useState({ title: '', content: '' });
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [fullPostData, setFullPostData] = useState<{ [key: string]: Post }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPostDisclosure = useDisclosure();
  const editPostDisclosure = useDisclosure();

  const posts: Post[] = useMemo(() => feedData?.posts || [], [feedData]);

  const popularPosts = useMemo(
    () => [...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0)).slice(0, 3)
    , [posts]
  );

  const pathname = usePathname();
  const locale = useMemo(() => pathname.split('/')[1], [pathname]);
  const searchParams = useSearchParams();
  const sharedPostId = searchParams.get('postId');

  const router = useRouter();
  
  // 게시물 필터링 로직 추가
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

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 압축
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // 최대 크기 제한 (너비 1200px)
          const maxWidth = 1200;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // JPEG로 압축 (품질 0.8)
            const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
            setPostData(prev => ({ ...prev, image: compressedImage }));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSavePost = async () => {
    try {
      if (!postData.title || !postData.content) {
        toast({
          title: 'Error',
          description: 'Please fill in both title and content',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      const response = await createPostMutation.mutateAsync(postData);
      if (response) {
        toast({
          title: 'Success',
          description: 'Post created successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        createPostDisclosure.onClose();
        setPostData({ title: '', content: '', image: '' });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const errorMsg = err?.response?.data?.error || 'Failed to create post';
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Failed to create post:', error);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post.id);
    setEditPostData({ title: post.title, content: post.content });
    editPostDisclosure.onOpen();
  };

  const handleSaveEditPost = async () => {
    try {
      if (editingPost) {
        await updatePostMutation.mutateAsync({ postId: editingPost, ...editPostData });
        editPostDisclosure.onClose();
        setEditingPost(null);
      }
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostMutation.mutateAsync(postId);
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
      
      // 확장된 상태면 전체 댓글 다시 로드
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

  const handleSaveEditComment = async () => {
    try {
      const { postId, commentId, content } = editingComment as {postId: string; commentId: string; content: string};
      if (!content || !content.trim()) return;

      await updateCommentMutation.mutateAsync({ postId, commentId, content });
      setEditingComment({});
      
      // 확장된 상태면 전체 댓글 다시 로드
      if (expandedComments.has(postId)) {
        const response = await apiClient.get(`/posts/${postId}`);
        setFullPostData({ ...fullPostData, [postId]: response.data });
      }
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync({ postId, commentId });
      
      // 확장된 상태면 전체 댓글 다시 로드
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
      duration: 3000,
    });
  };

  const handleExpandComments = async (postId: string) => {
    try {
      // 이미 확장된 상태면 토글
      if (expandedComments.has(postId)) {
        const newExpanded = new Set(expandedComments);
        newExpanded.delete(postId);
        setExpandedComments(newExpanded);
        return;
      }

      // 전체 게시물 데이터 가져오기
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
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'} p={{ base: 4, md: 8 }}>
        <VStack spacing={6} maxW="800px" mx="auto">
          <Heading>{t('feed.title')}</Heading>

          {/* New Post Card */}
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

          {/* Feed Posts */}
          <VStack spacing={4} width="100%">
            {!isLoading && popularPosts.length > 0 && !sharedPostId && (
              <Card width="100%" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
                <CardBody>
                  <Flex align="center" justify="space-between" mb={3}>
                    <Heading size="sm">{t('feed.bestPost') || 'Popular Posts'}</Heading>
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
                        <Flex align="center" justify="space-between" gap={3} cursor={`pointer`} onClick={() => { router.push(`/${locale}/feed?postId=${post.id}`) }}>
                          <Box flex={1} minW={0}>
                            <HStack spacing={2} mb={1}>
                              <Text fontWeight="bold" noOfLines={1}>
                                {post.title}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} noOfLines={1}>
                              {post.author?.username || t('feed.deletedUser') || '탈퇴한 사용자'}
                            </Text>
                          </Box>
                          <HStack spacing={2} flexShrink={0}>
                            <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                              ❤️ {post.likesCount || post._count?.likes || 0}
                            </Text>
                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleSharePost(post.id); }}>
                              {t('feed.share') || 'Share'}
                            </Button>
                          </HStack>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}
            {isLoading ? (
              <Text>{t('feed.loading') || 'Loading posts...'}</Text>
            ) : displayPosts.length > 0 ? (
              displayPosts.map((post: Post) => (
                <Card key={post.id} width="100%" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
                  <CardBody>
                    {/* Author Info */}
                    <Flex mb={4} align="center" justify="space-between">
                      <Flex align="center">
                        <Avatar
                          size="md"
                          name={post.author?.username || t('feed.deletedUser') || '탈퇴한 사용자'}
                          src={post.author?.avatar}
                          mr={3}
                        />
                        <Box>
                          <Text fontWeight="bold">{post.author?.username || t('feed.deletedUser') || '탈퇴한 사용자'}</Text>
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

                    {/* Post Content */}
                    <HStack spacing={2} mb={2} align="center">
                      <Heading size="md">{post.title}</Heading>
                    </HStack>
                    <Text mb={4}>{post.content}</Text>

                    {/* Post Image */}
                    {post.image && (
                      <Box mb={4} borderRadius="md" overflow="hidden" position="relative" minH="300px">
                        <NextImage  src={post.image} alt={post.title} width={800} height={600} style={{ width: '100%', height: 'auto' }}
                          loading="lazy" quality={85} />
                      </Box>
                    )}

                    {/* Pet Info */}
                    {post.pet && (
                      <Box mb={4} p={3} bg={colorMode === 'dark' ? 'gray.600' : 'gray.100'} borderRadius="md">
                        <Text fontSize="sm" fontWeight="bold">
                          🐾 {post.pet.name} ({post.pet.species}
                          {post.pet.breed ? ` - ${post.pet.breed}` : ''})
                        </Text>
                      </Box>
                    )}

                    {/* Badges */}
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

                    {/* Interactions */}
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
                        🔗 {t('feed.share') || 'Share'}
                      </Button>
                    </HStack>

                    {/* Comments Preview and Input */}
                    {(post.comments && post.comments.length > 0) || (expandedComments.has(post.id) && fullPostData[post.id]?.comments) ? (
                      <Box mb={4}>
                        <Flex justify="space-between" align="center" mb={2}>
                          <Text fontSize="sm" fontWeight="bold">
                            {t('feed.comments') || 'Comments'}
                          </Text>
                          {/* 이전 댓글 보기 버튼 */}
                          {(post.commentsCount || post._count?.comments || 0) > 3 && (
                            <Button
                              size="xs"
                              variant="link"
                              colorScheme="blue"
                              onClick={() => handleExpandComments(post.id)}
                            >
                              {expandedComments.has(post.id) 
                                ? (t('feed.showLess') || '간략히 보기')
                                : `${t('feed.viewAllComments') || '이전 댓글 보기'} (${(post.commentsCount || post._count?.comments || 0) - 3})`
                              }
                            </Button>
                          )}
                        </Flex>
                        {/* 댓글 목록 */}
                        {(expandedComments.has(post.id) && fullPostData[post.id]?.comments 
                          ? fullPostData[post.id].comments 
                          : post.comments || []
                        ).map((comment) => (
                          <Box key={comment.id} mb={2} p={2} bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'} borderRadius="md">
                            <Flex justify="space-between" align="start">
                              <Box flex={1}>
                                <Flex align="center" mb={1}>
                                  <Text fontSize="sm" fontWeight="bold" mr={2}>
                                    {comment.author?.username || t('feed.deletedUser') || '탈퇴한 사용자'}
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

                    {/* Add Comment */}
                    {auth && (
                      <HStack spacing={2}>
                        <Input
                          size="sm"
                          placeholder={t('feed.comment') || 'Add a comment...'}
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
                  <Text textAlign="center">{t('feed.noPosts') || 'No posts yet'}</Text>
                </CardBody>
              </Card>
            )}
          </VStack>
        </VStack>
      </Box>

      {/* Create Post Modal */}
      <Modal isOpen={createPostDisclosure.isOpen} onClose={createPostDisclosure.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('feed.createPost')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box width="100%">
                <Text fontWeight="bold" mb={2}>{t('feed.postTitle')}</Text>
                <Input
                  value={postData.title}
                  onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                  placeholder={t('feed.postTitle')}
                />
              </Box>
              <Box width="100%">
                <Text fontWeight="bold" mb={2}>{t('feed.postContent')}</Text>
                <Textarea
                  value={postData.content}
                  onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                  placeholder={t('feed.postContent')}
                />
              </Box>
              <Box width="100%">
                <Text fontWeight="bold" mb={2}>{t('feed.uploadImage')}</Text>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <Button 
                  width="100%"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  {postData.image ? t('feed.changeImage') : t('feed.uploadImage')}
                </Button>
                {postData.image && (
                  <Box mt={2} position="relative">
                    <Image src={postData.image} alt="preview" borderRadius="md" />
                    <Button
                      position="absolute"
                      top={2}
                      right={2}
                      size="sm"
                      onClick={() => setPostData({ ...postData, image: '' })}
                    >
                      ✕
                    </Button>
                  </Box>
                )}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={createPostDisclosure.onClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleSavePost} isLoading={createPostMutation.isPending}>
              {t('feed.post')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Post Modal */}
      <Modal isOpen={editPostDisclosure.isOpen} onClose={editPostDisclosure.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('feed.editPost') || 'Edit Post'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box width="100%">
                <Text fontWeight="bold" mb={2}>{t('feed.postTitle')}</Text>
                <Input
                  value={editPostData.title}
                  onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })}
                  placeholder={t('feed.postTitle')}
                />
              </Box>
              <Box width="100%">
                <Text fontWeight="bold" mb={2}>{t('feed.postContent')}</Text>
                <Textarea
                  value={editPostData.content}
                  onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })}
                  placeholder={t('feed.postContent')}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={editPostDisclosure.onClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleSaveEditPost} isLoading={updatePostMutation.isPending}>
              {t('common.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Comment Modal */}
      {Object.keys(editingComment).length > 0 && (
        <Modal isOpen={true} onClose={() => setEditingComment({})}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Comment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Textarea
                value={(editingComment as {postId: string; commentId: string; content: string}).content}
                onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                placeholder="Edit your comment..."
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={() => setEditingComment({})}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="blue" onClick={handleSaveEditComment} isLoading={updateCommentMutation.isPending}>
                {t('common.save')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
