'use client';

import { useTranslations } from 'next-intl';
import { Box, VStack, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Textarea, Image, useToast } from '@chakra-ui/react';
import { useCreatePost, useUpdateComment, useUpdatePost } from '@/hooks/usePost';
import { PostModalProps } from '@/types';
import { useRef, useCallback } from 'react';
import apiClient from '@/api/client';

export default function PostModal({ createPostDisclosure, editPostDisclosure, postData, setPostData, editingPost, setEditingPost, editPostData, setEditPostData, editingComment, setEditingComment, fullPostData, setFullPostData, expandedComments }
: PostModalProps) {
  const t = useTranslations();
  const createPostMutation = useCreatePost();
  const updateCommentMutation = useUpdateComment();
  const updatePostMutation = useUpdatePost();
  const toast = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            setPostData({ ...postData, image: compressedImage });
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, [postData, setPostData]);

  const handleSavePost = async () => {
    try {
      if (!postData.title || !postData.content) {
        toast({
          title: 'Error',
          description: 'Please fill in both title and content',
          status: 'error',
          duration: 3000,
          isClosable: true
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
          isClosable: true
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
        isClosable: true
      });
      console.error('Failed to create post:', error);
    }
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

  return (
    <Box>
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
          <ModalHeader>{t('feed.editPost')}</ModalHeader>
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
            <ModalHeader>{t('feed.editComment')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Textarea
                value={(editingComment as {postId: string; commentId: string; content: string}).content}
                onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                placeholder={t('feed.editYourComment')}
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
