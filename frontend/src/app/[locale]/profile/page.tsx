'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, VStack, Heading, Grid, Button, Card, CardBody, useColorMode, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Textarea, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, HStack, useToast } from '@chakra-ui/react';
import { useAuthStore } from '@/store';
import { useGetCurrentUser, useUpdateProfile, useGetPets, useDeletePet } from '@/hooks/useProfile';
import apiClient from '@/api/client';
import { useRef } from 'react';
import LogModal from '@/app/[locale]/profile/_ui/LogModal';
import CardModal from '@/app/[locale]/profile/_ui/CardModal';
import FollowingList from '@/components/FollowingList';
import FollowerList from '@/components/FollowerList';
import { Pet } from '@/types';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { colorMode } = useColorMode();
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const toast = useToast();
  
  // Get current user and pets
  const { data: currentUser, isLoading: userLoading } = useGetCurrentUser();
  const { data: pets = [], isLoading: petsLoading } = useGetPets(currentUser?.id);
  
  const [profileData, setProfileData] = useState({ username: '', bio: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | undefined>(undefined);
  const [petModalMode, setPetModalMode] = useState<'add' | 'edit'>('add');
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);

  const editProfileDisclosure = useDisclosure();
  const petModalDisclosure = useDisclosure();
  const deleteConfirmDisclosure = useDisclosure();
  const deletePetDisclosure = useDisclosure();
  const logModalDisclosure = useDisclosure();
  const followingListDisclosure = useDisclosure();
  const followerListDisclosure = useDisclosure();
  const [selectedPetForLog, setSelectedPetForLog] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deletePetCancelRef = useRef<HTMLButtonElement>(null);

  const updateProfileMutation = useUpdateProfile();
  const deletePetMutation = useDeletePet();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, router, locale]);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        username: currentUser.username || '',
        bio: currentUser.bio || ''
      });
    }
  }, [currentUser]);

  if (!isAuthenticated) {
    return null;
  }

  const handleEditProfile = () => {
    setProfileData({
      username: currentUser?.username || '',
      bio: currentUser?.bio || ''
    });
    editProfileDisclosure.onOpen();
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(profileData);
      editProfileDisclosure.onClose();
      toast({
        title: t('common.success'),
        description: t('profile.toast.profileUpdated'),
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: t('common.error'),
        description: t('profile.toast.profileUpdateFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleAddPet = () => {
    setPetModalMode('add');
    setSelectedPet(undefined);
    petModalDisclosure.onOpen();
  };

  const handleEditPet = (pet: Pet) => {
    setPetModalMode('edit');
    setSelectedPet(pet);
    petModalDisclosure.onOpen();
  };

  const handleDeletePet = (pet: Pet) => {
    setDeletingPet(pet);
    deletePetDisclosure.onOpen();
  };

  const confirmDeletePet = async () => {
    try {
      if (deletingPet) {
        await deletePetMutation.mutateAsync(deletingPet.id);
        deletePetDisclosure.onClose();
        setDeletingPet(null);
        toast({
          title: t('common.success'),
          description: t('profile.toast.petDeleted'),
          status: 'success',
          duration: 2000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Failed to delete pet:', error);
      toast({
        title: t('common.error'),
        description: t('profile.toast.petDeleteFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleDeleteAccount = () => {
    deleteConfirmDisclosure.onOpen();
  };

  const confirmDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await apiClient.delete('/auth/me');
      deleteConfirmDisclosure.onClose();
      logout();
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 100);
    } catch (error) {
      console.error('Failed to delete account:', error);
      setIsDeleting(false);
      toast({
        title: t('common.error'),
        description: t('profile.toast.deleteAccountFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Box>
      <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'} p={{ base: 4, md: 8 }}>
        <VStack spacing={8} maxW="1200px" mx="auto">
          {/* User Profile Section */}
          <Card width="100%" bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
            <CardBody>
              <Heading size="md" mb={4}>
                {t('profile.title')}
              </Heading>
              {userLoading ? (
                <Text>{t('common.loading')}</Text>
              ) : (
                <VStack spacing={4} align="start">
                  <Box>
                    <Text fontWeight="bold">{t('profile.username')}</Text>
                    <Text>{currentUser?.username || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">{t('auth.email')}</Text>
                    <Text>{currentUser?.email || 'N/A'}</Text>
                  </Box>
                  {currentUser?.bio && (
                    <Box>
                      <Text fontWeight="bold">{t('profile.bio')}</Text>
                      <Text>{currentUser.bio}</Text>
                    </Box>
                  )}
                  
                  {/* Follow Stats */}
                  {/* <HStack spacing={4}>
                    <Box>
                      <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                        {t('profile.followers')}
                      </Text>
                      <Button variant="ghost" size="sm" onClick={followerListDisclosure.onOpen}>
                        <Text fontWeight="bold" fontSize="lg">
                          {currentUser?.followers || 0}
                        </Text>
                      </Button>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                        {t('profile.following')}
                      </Text>
                      <Button variant="ghost" size="sm" onClick={followingListDisclosure.onOpen}>
                        <Text fontWeight="bold" fontSize="lg">
                          {currentUser?.following || 0}
                        </Text>
                      </Button>
                    </Box>
                  </HStack> */}
                  
                  <Box>
                    <Button colorScheme="blue" mr={2} onClick={handleEditProfile}>
                      {t('profile.editProfile')}
                    </Button>
                    <Button colorScheme="red" onClick={handleDeleteAccount}>
                      {t('profile.deleteAccount')}
                    </Button>
                  </Box>
                </VStack>
              )}
            </CardBody>
          </Card>

          {/* Pets Section */}
          <Box width="100%">
            <Heading size="md" mb={4}>
              {t('profile.pets')} ({pets.length})
            </Heading>
            {petsLoading ? (
              <Text>{t('common.loading')}</Text>
            ) : pets.length === 0 ? (
              <Button colorScheme="green" onClick={handleAddPet}>
                {t('profile.addPet')}
              </Button>
            ) : (
              <>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4} mb={4}>
                  {pets.map((pet: Pet) => (
                    <Card key={pet.id} bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
                      <CardBody>
                        <Heading size="sm">{pet.name}</Heading>
                        <Box fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                          {pet.species} {pet.breed && `- ${pet.breed}`}
                          {pet.age && `, Age: ${pet.age}`}
                        </Box>
                        <HStack mt={4} spacing={2}>
                          <Button size="sm" colorScheme="blue" onClick={() => handleEditPet(pet)}>
                            {t('common.edit')}
                          </Button>
                          <Button size="sm" colorScheme="purple" onClick={() => {
                            setSelectedPetForLog(pet.id);
                            logModalDisclosure.onOpen();
                          }}>
                            {t('dashboard.logs')}
                          </Button>
                          <Button size="sm" colorScheme="red" onClick={() => handleDeletePet(pet)}>
                            {t('common.delete')}
                          </Button>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </Grid>
                <Button colorScheme="green" onClick={handleAddPet}>
                  {t('profile.addPet')}
                </Button>
              </>
            )}
          </Box>
        </VStack>
      </Box>

      {/* Edit Profile Modal */}
      <Modal isOpen={editProfileDisclosure.isOpen} onClose={editProfileDisclosure.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('profile.editProfile')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box width="100%">
                <Text fontWeight="bold" mb={2}>{t('profile.username')}</Text>
                <Input
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                />
              </Box>
              <Box width="100%">
                <Text fontWeight="bold" mb={2}>{t('profile.bio')}</Text>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={editProfileDisclosure.onClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleSaveProfile} isLoading={updateProfileMutation.isPending}>
              {t('common.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteConfirmDisclosure.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteConfirmDisclosure.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('profile.deleteAccountTitle')}
            </AlertDialogHeader>
            <AlertDialogBody>
              {t('profile.deleteAccountMessage')}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteConfirmDisclosure.onClose} isDisabled={isDeleting}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteAccount} ml={3} isLoading={isDeleting}>
                {t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Delete Pet Confirmation Dialog */}
      <AlertDialog
        isOpen={deletePetDisclosure.isOpen}
        leastDestructiveRef={deletePetCancelRef}
        onClose={deletePetDisclosure.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('profile.deletePetTitle')}
            </AlertDialogHeader>
            <AlertDialogBody>
              {t('profile.deletePetMessage')}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deletePetCancelRef} onClick={deletePetDisclosure.onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" onClick={confirmDeletePet} ml={3} isLoading={deletePetMutation.isPending}>
                {t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Pet Modal */}
      <CardModal
        isOpen={petModalDisclosure.isOpen}
        onClose={petModalDisclosure.onClose}
        mode={petModalMode}
        pet={selectedPet}
      />

      {/* Log Modal */}
      {selectedPetForLog && (
        <LogModal
          isOpen={logModalDisclosure.isOpen}
          onClose={logModalDisclosure.onClose}
          petId={selectedPetForLog}
        />
      )}

      {/* Following List Modal */}
      {currentUser && followingListDisclosure.isOpen && (
        <FollowingList
          isOpen={followingListDisclosure.isOpen}
          onClose={followingListDisclosure.onClose}
          userId={currentUser.id}
        />
      )}

      {/* Follower List Modal */}
      {currentUser && followerListDisclosure.isOpen && (
        <FollowerList
          isOpen={followerListDisclosure.isOpen}
          onClose={followerListDisclosure.onClose}
          userId={currentUser.id}
        />
      )}
    </Box>
  );
}
