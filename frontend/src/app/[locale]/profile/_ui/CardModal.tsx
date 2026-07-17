'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Box, VStack, Button, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, useToast } from '@chakra-ui/react';
import { useAddPet, useUpdatePet } from '@/hooks/useProfile';
import { Pet } from '@/types';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  pet?: Pet;
}

export default function CardModal({ isOpen, onClose, mode, pet }: CardModalProps) {
  const t = useTranslations();
  const toast = useToast();
  
  const [petData, setPetData] = useState({ name: '', species: '', breed: '', age: '' });

  const addPetMutation = useAddPet();
  const updatePetMutation = useUpdatePet();

  // mode나 pet이 변경되면 petData 초기화
  useEffect(() => {
    if (mode === 'edit' && pet) {
      setPetData({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || '',
        age: pet.age?.toString() || ''
      });
    } else if (mode === 'add') {
      setPetData({ name: '', species: '', breed: '', age: '' });
    }
  }, [mode, pet]);

  const handleSave = async () => {
    try {
      if (!petData.name || !petData.species) {
        toast({
          title: t('common.error'),
          description: t('profile.validation.nameAndSpeciesRequired'),
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        return;
      }
      
      if (mode === 'add') {
        await addPetMutation.mutateAsync({ 
          name: petData.name, 
          species: petData.species, 
          breed: petData.breed || undefined,
          age: petData.age ? parseInt(petData.age) : undefined
        });
        toast({
          title: t('common.success'),
          description: t('profile.toast.petAdded'),
          status: 'success',
          duration: 2000,
          isClosable: true
        });
      } else if (mode === 'edit' && pet) {
        await updatePetMutation.mutateAsync({
          petId: pet.id,
          name: petData.name,
          species: petData.species,
          breed: petData.breed || undefined,
          age: petData.age ? parseInt(petData.age) : undefined
        });
        toast({
          title: t('common.success'),
          description: t('profile.toast.petUpdated'),
          status: 'success',
          duration: 2000,
          isClosable: true
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save pet:', error);
      toast({
        title: t('common.error'),
        description: mode === 'add' ? t('profile.toast.petAddFailed') : t('profile.toast.petUpdateFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <>
      {/* Pet Modal (Add or Edit) */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {mode === 'add' ? t('profile.addPet') : `${t('common.edit')} ${t('profile.pet')}`}
          </ModalHeader>
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
                  type="number"
                  value={petData.age}
                  onChange={(e) => setPetData({ ...petData, age: e.target.value })}
                  placeholder={t('profile.age')}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button 
              colorScheme={mode === 'add' ? 'green' : 'blue'} 
              onClick={handleSave} 
              isLoading={addPetMutation.isPending || updatePetMutation.isPending}
            >
              {mode === 'add' ? t('common.add') : t('common.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
