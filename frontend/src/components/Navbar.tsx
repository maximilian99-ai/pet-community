'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useColorMode, Box, Flex, Button, HStack } from '@chakra-ui/react';
import { useAuthStore } from '@/store';

export function Navbar() {
  const t = useTranslations();
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <Box bg={colorMode === 'dark' ? 'gray.800' : 'white'} borderBottom="1px" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'} py={4} px={8}>
      <Flex justify="space-between" align="center" maxW="1400px" mx="auto">
        <Flex gap={6} align="center">
          <Button variant="ghost" onClick={() => navigateTo('/')}>
            {t('nav.feed')}
          </Button>
          {isAuthenticated && (
            <>
              <Button variant="ghost" onClick={() => navigateTo('/dashboard')}>
                {t('nav.dashboard')}
              </Button>
              <Button variant="ghost" onClick={() => navigateTo('/profile')}>
                {t('nav.profile')}
              </Button>
            </>
          )}
        </Flex>

        <HStack spacing={4}>
          <Button
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
          >
            {colorMode === 'dark' ? '☀️' : '🌙'}
          </Button>

          {isAuthenticated ? (
            <Button colorScheme="red" size="sm" onClick={handleLogout}>
              {t('nav.logout')}
            </Button>
          ) : (
            <>
              <Button colorScheme="blue" variant="outline" size="sm" onClick={() => navigateTo('/login')}>
                {t('nav.login')}
              </Button>
              <Button colorScheme="green" size="sm" onClick={() => navigateTo('/signup')}>
                {t('nav.signup')}
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
