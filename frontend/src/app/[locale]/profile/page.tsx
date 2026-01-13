'use client';

import { useTranslations } from 'next-intl';
import { Box, VStack, Heading, Grid, Button, Card, CardBody } from '@chakra-ui/react';
import { useProfileStore } from '@/store';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const t = useTranslations();
  const user = useProfileStore((state) => state.user);
  const pets = useProfileStore((state) => state.pets);

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 8 }}>
      <VStack spacing={8} maxW="1200px" mx="auto">
        {/* User Profile Section */}
        <Card width="100%">
          <CardBody>
            <Heading size="md" mb={4}>
              {t('profile.title')}
            </Heading>
            <VStack spacing={4} align="start">
              <Box>{user?.username || 'Loading...'}</Box>
              <Box>{user?.bio || 'No bio yet'}</Box>
              <Button colorScheme="blue">{t('profile.editProfile')}</Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Pets Section */}
        <Box width="100%">
          <Heading size="md" mb={4}>
            {t('profile.pets')} ({pets.length})
          </Heading>
          {pets.length === 0 ? (
            <Button colorScheme="green">{t('profile.addPet')}</Button>
          ) : (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
              {pets.map((pet) => (
                <Card key={pet.id}>
                  <CardBody>
                    <Heading size="sm">{pet.name}</Heading>
                    <Box fontSize="sm" color="gray.600">
                      {pet.species} {pet.breed && `- ${pet.breed}`}
                    </Box>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
