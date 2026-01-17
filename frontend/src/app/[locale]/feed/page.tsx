'use client';

import { useTranslations } from 'next-intl';
import { useColorMode, Box, VStack, Card, CardBody, Heading, Text, Button, HStack, Avatar, Divider, Flex, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Textarea } from '@chakra-ui/react';
import { useAuthStore } from '@/store';
import { useGetPosts } from '@/hooks/usePost';
import { useCreatePost, useAddComment, useLikePost } from '@/hooks/usePost';
import { Post } from '@/types';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

export default function FeedPage() {
  const t = useTranslations();
  const { colorMode } = useColorMode();
  const auth = useAuthStore(state => state.isAuthenticated);
  const { data: feedData, isLoading, refetch } = useGetPosts(10, 0);
  const createPostMutation = useCreatePost();
  const addCommentMutation = useAddComment();
  const likePostMutation = useLikePost();
  
  const [postData, setPostData] = useState({ title: '', content: '' });
  const [commentData, setCommentData] = useState<{ [key: string]: string }>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const createPostDisclosure = useDisclosure();

  const posts: Post[] = feedData?.posts || [];

  const handleCreatePost = () => {
    setPostData({ title: '', content: '' });
    createPostDisclosure.onOpen();
  };

  const handleSavePost = async () => {
    try {
      await createPostMutation.mutateAsync(postData);
      createPostDisclosure.onClose();
      setPostData({ title: '', content: '' });
      refetch();
    } catch (error) {
      console.error('Failed to create post:', error);
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

  const handleLikePost = async (postId: string) => {
    try {
      await likePostMutation.mutateAsync(postId);
      
      // Toggle liked status locally
      const newLikedPosts = new Set(likedPosts);
      if (newLikedPosts.has(postId)) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }
      setLikedPosts(newLikedPosts);
      refetch();
    } catch (error) {
      console.error('Failed to like post:', error);
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
            {isLoading ? (
              <Text>{t('feed.loading') || 'Loading posts...'}</Text>
            ) : posts.length > 0 ? (
              posts.map((post: Post) => (
                <Card key={post.id} width="100%" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
                  <CardBody>
                    {/* Author Info */}
                    <Flex mb={4} align="center">
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

                    <Divider mb={4} />

                    {/* Post Content */}
                    <Heading size="md" mb={2}>
                      {post.title}
                    </Heading>
                    <Text mb={4}>{post.content}</Text>

                    {/* Pet Info */}
                    {post.pet && (
                      <Box mb={4} p={3} bg={colorMode === 'dark' ? 'gray.600' : 'gray.100'} borderRadius="md">
                        <Text fontSize="sm" fontWeight="bold">
                          🐾 {post.pet.name} ({post.pet.species}
                          {post.pet.breed ? ` - ${post.pet.breed}` : ''})
                        </Text>
                      </Box>
                    )}

                    {/* Post Image */}
                    {post.image && (
                      <Box mb={4} borderRadius="md" overflow="hidden">
                        <img src={post.image} alt={post.title} style={{ width: '100%', height: 'auto' }} />
                      </Box>
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
                        {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes?.length || 0}
                      </Button>
                      <Button size="sm" variant="ghost">
                        💬 {post.comments?.length || 0}
                      </Button>
                      <Button size="sm" variant="ghost">
                        🔄 {t('feed.share') || 'Share'}
                      </Button>
                    </HStack>

                    {/* Comments Preview and Input */}
                    {post.comments && post.comments.length > 0 && (
                      <Box mb={4}>
                        <Text fontSize="sm" fontWeight="bold" mb={2}>
                          {t('feed.comments') || 'Comments'}
                        </Text>
                        {post.comments.slice(0, 2).map((comment) => (
                          <Box key={comment.id} mb={2} p={2} bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'} borderRadius="md">
                            <Flex>
                              <Text fontSize="sm" fontWeight="bold" mr={2}>
                                {comment.author.username}
                              </Text>
                              <Text fontSize="sm">{comment.content}</Text>
                            </Flex>
                          </Box>
                        ))}
                        {post.comments.length > 2 && (
                          <Text fontSize="sm" color="blue.500" mt={2}>
                            {t('feed.viewMore') || 'View more comments'}
                          </Text>
                        )}
                      </Box>
                    )}

                    {/* Add Comment */}
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
    </Box>
  );
}
