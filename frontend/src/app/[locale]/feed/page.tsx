'use client';

import { useTranslations } from 'next-intl';
import { useColorMode, Box, VStack, Card, CardBody, Heading, Text, Button, HStack, Avatar, Divider, Flex, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Textarea, Image, useToast, Badge } from '@chakra-ui/react';
import { useAuthStore } from '@/store';
import { useGetPosts } from '@/hooks/usePost';
import { useCreatePost, useAddComment, useLikePost, useDeleteComment, useUpdateComment, useUpdatePost, useDeletePost } from '@/hooks/usePost';
import { Post } from '@/types';
import { useState, useRef, Suspense, useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

function FeedPageContent() {
  const t = useTranslations();
  const { colorMode } = useColorMode();
  const auth = useAuthStore(state => state.isAuthenticated);
  const currentUserId = useAuthStore(state => state.username);
  const { data: feedData, isLoading, refetch } = useGetPosts(10, 0);
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
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editPostData, setEditPostData] = useState({ title: '', content: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPostDisclosure = useDisclosure();
  const editPostDisclosure = useDisclosure();

  const posts: Post[] = feedData?.posts || [];

  // 초기화: 백엔드에서 제공하는 isLikedByCurrentUser 정보 사용
  const [likedPostsMap, setLikedPostsMap] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (feedData?.posts && feedData.posts.length > 0) {
      const newLikedMap: {[key: string]: boolean} = {};
      (feedData.posts as Post[]).forEach(post => {
        newLikedMap[post.id] = post.isLikedByCurrentUser || false;
      });
      setLikedPostsMap(newLikedMap);
    }
  }, [feedData?.posts]);

  const TopBadge = () => (
    <Badge
      colorScheme="yellow"
      variant="solid"
      borderRadius="full"
      px={2}
      py={0.5}
      fontSize="xs"
    >
      TOP
    </Badge>
  );

  const popularPosts = [...posts]
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 3);
  const topPopularPostId = popularPosts[0]?.id;

  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const searchParams = useSearchParams();
  const sharedPostId = searchParams.get('postId');
  
  // 게시물 필터링 로직 추가
  const displayPosts = sharedPostId 
    ? posts.filter(post => post.id === sharedPostId)
    : posts;

  const handleCreatePost = () => {
    setPostData({ title: '', content: '', image: '' });
    createPostDisclosure.onOpen();
  };

  const router = useRouter();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setPostData({ ...postData, image: compressedImage });
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

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
        refetch();
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
        refetch();
      }
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostMutation.mutateAsync(postId);
      refetch();
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
      refetch();
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
      refetch();
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync({ postId, commentId });
      refetch();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await likePostMutation.mutateAsync(postId);
      // UI 업데이트는 서버에서 받은 새로운 데이터로 자동 처리됨
      refetch();
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
                    <TopBadge />
                  </Flex>
                  <VStack spacing={2} align="stretch">
                    {popularPosts.map((post, index) => (
                      <Box
                        key={post.id}
                        p={3}
                        borderRadius="md"
                        bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'}
                      >
                        <Flex align="center" justify="space-between" gap={3} onClick={() => { router.push(`/${locale}/feed?postId=${post.id}`) }} cursor={'pointer'}>
                          <Box flex={1} minW={0}>
                            <HStack spacing={2} mb={1}>
                              <Text fontWeight="bold" noOfLines={1}>
                                {post.title}
                              </Text>
                              {index === 0 && <TopBadge />}
                            </HStack>
                            <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} noOfLines={1}>
                              {post.author.username}
                            </Text>
                          </Box>
                          <HStack spacing={2} flexShrink={0}>
                            <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                              ❤️ {post.likes?.length || 0}
                            </Text>
                            <Button size="sm" variant="outline" onClick={() => handleSharePost(post.id)}>
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
                          name={post.author.username}
                          src={post.author.avatar}
                          mr={3}
                        />
                        <Box>
                          <Text fontWeight="bold">{post.author.username}</Text>
                          <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </Text>
                        </Box>
                      </Flex>
                      {currentUserId === post.author.username && (
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
                      {post.id === topPopularPostId && <TopBadge />}
                    </HStack>
                    <Text mb={4}>{post.content}</Text>

                    {/* Post Image */}
                    {post.image && (
                      <Box mb={4} borderRadius="md" overflow="hidden">
                        <Image src={post.image} alt={post.title} width="100%" />
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
                        {likedPostsMap[post.id] ? '❤️' : '🤍'} {post.likes?.length || 0}
                      </Button>
                      <Button size="sm" variant="ghost">
                        💬 {post.comments?.length || 0}
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
                    {post.comments && post.comments.length > 0 && (
                      <Box mb={4}>
                        <Text fontSize="sm" fontWeight="bold" mb={2}>
                          {t('feed.comments') || 'Comments'}
                        </Text>
                        {post.comments.map((comment) => (
                          <Box key={comment.id} mb={2} p={2} bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'} borderRadius="md">
                            <Flex justify="space-between" align="start">
                              <Box flex={1}>
                                <Flex align="center" mb={1}>
                                  <Text fontSize="sm" fontWeight="bold" mr={2}>
                                    {comment.author.username}
                                  </Text>
                                  {currentUserId === comment.author.username && (
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
                    )}

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
                <Text fontWeight="bold" mb={2}>Image Upload</Text>
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
                  {postData.image ? 'Change Image' : 'Upload Image'}
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

export default function FeedPage() {
  return (
    <Suspense fallback={<Box p={8}><Text>Loading...</Text></Box>}>
      <FeedPageContent />
    </Suspense>
  );
}
