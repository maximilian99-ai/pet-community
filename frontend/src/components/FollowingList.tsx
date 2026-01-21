'use client';

import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  HStack,
  Text,
  Avatar,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useGetFollowingUsers, useFollowUser, useUnfollowUser } from '@/hooks/useFollow';
import { useAuthStore } from '@/store';
import { useState, useEffect } from 'react';

interface FollowingListProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface UserItem {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
}

export default function FollowingList({ isOpen, onClose, userId }: FollowingListProps) {
  const t = useTranslations();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const currentUserId = useAuthStore((state) => state.userId);

  const { data: followingUsers = [], isLoading } = useGetFollowingUsers(userId, 50);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const [followingMap, setFollowingMap] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const map: { [key: string]: boolean } = {};
    followingUsers.forEach((user: UserItem) => {
      map[user.id] = true; // These are users that the current user is following
    });
    setFollowingMap(map);
  }, [followingUsers]);

  const handleToggleFollow = async (targetUserId: string) => {
    try {
      if (followingMap[targetUserId]) {
        await unfollowMutation.mutateAsync(targetUserId);
        setFollowingMap((prev) => ({ ...prev, [targetUserId]: false }));
        toast({
          title: 'Success',
          description: 'Unfollowed user',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        await followMutation.mutateAsync(targetUserId);
        setFollowingMap((prev) => ({ ...prev, [targetUserId]: true }));
        toast({
          title: 'Success',
          description: 'Followed user',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error',
        description: 'Failed to follow/unfollow user',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
        <ModalHeader>{t('following') || 'Following'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {isLoading ? (
            <Text>{t('loading')}</Text>
          ) : followingUsers.length === 0 ? (
            <Text>{t('noFollowing') || 'Not following anyone'}</Text>
          ) : (
            <VStack spacing={4}>
              {followingUsers.map((user: UserItem) => (
                <Box
                  key={user.id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="lg"
                  width="100%"
                  bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
                >
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Avatar name={user.username} src={user.avatar} size="sm" />
                      <Box>
                        <Text fontWeight="bold">{user.username}</Text>
                        {user.bio && (
                          <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                            {user.bio}
                          </Text>
                        )}
                      </Box>
                    </HStack>
                    {currentUserId !== user.id && (
                      <Button
                        size="sm"
                        colorScheme={followingMap[user.id] ? 'red' : 'blue'}
                        onClick={() => handleToggleFollow(user.id)}
                        isLoading={
                          followMutation.isPending || unfollowMutation.isPending
                        }
                      >
                        {followingMap[user.id]
                          ? t('unfollow') || 'Unfollow'
                          : t('follow') || 'Follow'}
                      </Button>
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
