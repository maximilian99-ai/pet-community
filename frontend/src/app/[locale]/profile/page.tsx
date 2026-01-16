'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, VStack, Heading, Grid, Button, Card, CardBody, useColorMode } from '@chakra-ui/react';
import { useProfileStore, useAuthStore } from '@/store';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const user = useProfileStore((state) => state.user);
  const pets = useProfileStore((state) => state.pets);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

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
              <VStack spacing={4} align="start">
                <Box>{user?.username || 'Loading...'}</Box>
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
            )}
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
