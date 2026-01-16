'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useColorMode, Box, Flex, Button, HStack, Text, Heading } from '@chakra-ui/react';
import { useAuthStore } from '@/store';
import { useEffect, useState } from 'react';

export function Navbar() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isAuthenticated, logout, username } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const locale = pathname.split('/')[1];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push(`/${locale}/feed`);
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Box
      bg={colorMode === 'dark' ? 'gray.800' : 'white'}
      borderBottom="1px"
      borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
      py={4}
      px={{ base: 4, md: 6, lg: 8 }}
    >
      <Flex justify="space-between" align="center" maxW="1400px" mx="auto" gap={4}>
        {/* Left Side */}
        <Flex cursor="pointer" onClick={() => { router.push(`/${locale}/feed`) }}>
          <Heading as="h1" size="lg" color={colorMode === 'dark' ? 'white' : 'black'}>
            🐾 Pet Community
          </Heading>
        </Flex>

        {/* Center */}
        <Flex align="center" flex={1}>
          {isAuthenticated && (
            <Text fontSize={{ base: 'sm', md: 'md', lg: 'lg' }} fontWeight="medium" cursor="pointer" onClick={() => { navigateTo(`/${locale}/profile`) }}>
              {t('nav.welcome', { username })}
            </Text>
          )}
        </Flex>

        {/* Right side */}
        <HStack spacing={{ base: 2, md: 4 }}>
          <Button
            onClick={toggleColorMode}
            variant="ghost"
            size={{ base: 'sm', md: 'md' }}
          >
            {colorMode === 'dark' ? '☀️' : '🌙'}
          </Button>

          {isAuthenticated ? (
            <Button
              colorScheme="red"
              size={{ base: 'sm', md: 'md' }}
              onClick={handleLogout}
            >
              {t('nav.logout')}
            </Button>
          ) : (
            <>
              <Button
                colorScheme="blue"
                variant="outline"
                size={{ base: 'sm', md: 'md' }}
                onClick={() => {
                  const locale = pathname.split('/')[1];
                  navigateTo(`/${locale}/login`);
                }}
              >
                {t('nav.login')}
              </Button>
              <Text display={{ base: 'none', md: 'block' }}>|</Text>
              <Button
                colorScheme="green"
                size={{ base: 'sm', md: 'md' }}
                onClick={() => {
                  const locale = pathname.split('/')[1];
                  navigateTo(`/${locale}/signup`);
                }}
              >
                {t('nav.signup')}
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
