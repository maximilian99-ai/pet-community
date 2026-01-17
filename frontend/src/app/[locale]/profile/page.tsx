'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, VStack, Heading, Grid, Button, Card, CardBody, useColorMode, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Textarea, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from '@chakra-ui/react';
import { useAuthStore } from '@/store';
import { useGetCurrentUser, useUpdateProfile, useGetPets, useAddPet } from '@/hooks/useProfile';
import apiClient from '@/api/client';
import { useRef } from 'react';

export const dynamic = 'force-dynamic';

interface PetType {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
}

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Get current user and pets
  const { data: currentUser, isLoading: userLoading } = useGetCurrentUser();
  const { data: pets = [], isLoading: petsLoading } = useGetPets(currentUser?.id);
  
  const [profileData, setProfileData] = useState({ username: '', bio: '' });
  const [petData, setPetData] = useState({ name: '', species: '', breed: '', age: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const editProfileDisclosure = useDisclosure();
  const addPetDisclosure = useDisclosure();
  const deleteConfirmDisclosure = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const updateProfileMutation = useUpdateProfile();
  const addPetMutation = useAddPet();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        username: currentUser.username || '',
        bio: currentUser.bio || '',
      });
    }
  }, [currentUser]);

  if (!isAuthenticated) {
    return null;
  }

  const handleEditProfile = () => {
    setProfileData({
      username: currentUser?.username || '',
      bio: currentUser?.bio || '',
    });
    editProfileDisclosure.onOpen();
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(profileData);
      editProfileDisclosure.onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAddPet = () => {
    setPetData({ name: '', species: '', breed: '', age: '' });
    addPetDisclosure.onOpen();
  };

  const handleSaveAddPet = async () => {
    try {
      await addPetMutation.mutateAsync({ 
        name: petData.name, 
        species: petData.species, 
        breed: petData.breed || undefined,
        age: petData.age ? parseInt(petData.age) : undefined
      });
      addPetDisclosure.onClose();
    } catch (error) {
      console.error('Failed to add pet:', error);
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
      router.push('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      setIsDeleting(false);
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
                  {pets.map((pet: PetType) => (
                    <Card key={pet.id} bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
                      <CardBody>
                        <Heading size="sm">{pet.name}</Heading>
                        <Box fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                          {pet.species} {pet.breed && `- ${pet.breed}`}
                        </Box>
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

      {/* Add Pet Modal */}
      <Modal isOpen={addPetDisclosure.isOpen} onClose={addPetDisclosure.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('profile.addPet')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box width="100%">
                <Text fontWeight="bold" mb={2}>{t('profile.petName')}</Text>
                <Input
                  value={petData.name}
                  onChange={(e) => setPetData({ ...petData, name: e.target.value })}
                  placeholder={t('profile.petName')}
                />
              </Box>
              <Box width="100%">
                <Text fontWeight="bold" mb={2}>{t('profile.species')}</Text>
                <Input
                  value={petData.species}
                  onChange={(e) => setPetData({ ...petData, species: e.target.value })}
                  placeholder={t('profile.species')}
                />
              </Box>
              <Box width="100%">
                <Text fontWeight="bold" mb={2}>{t('profile.breed')}</Text>
                <Input
                  value={petData.breed}
                  onChange={(e) => setPetData({ ...petData, breed: e.target.value })}
                  placeholder={t('profile.breed')}
                />
              </Box>
              <Box width="100%">
                <Text fontWeight="bold" mb={2}>{t('profile.age')}</Text>
                <Input
                  value={petData.age}
                  onChange={(e) => setPetData({ ...petData, age: e.target.value })}
                  placeholder={t('profile.age')}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={addPetDisclosure.onClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="green" onClick={handleSaveAddPet} isLoading={addPetMutation.isPending}>
              {t('common.add')}
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
    </Box>
  );
}
