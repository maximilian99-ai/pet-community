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
    setTimeout(() => {
      router.push(`/${locale}/feed`);
    }, 100);
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
      <Flex justify="space-between" align="center" maxW="1400px" mx="auto" gap={2}>
        {/* Left Side */}
        <Flex cursor="pointer" onClick={() => { router.push(`/${locale}/feed`) }}>
          <Heading as="h1" size={{ base: 'sm', md: 'lg' }} color={colorMode === 'dark' ? 'white' : 'black'}>
            🐾 Pet Community
          </Heading>
        </Flex>

        {/* Center - Hidden on mobile */}
        <Flex align="center" gap={4} display={{ base: 'none', md: 'flex' }}>
          {isAuthenticated && (
            <Text fontSize={{ base: 'sm', md: 'md', lg: 'lg' }} fontWeight="medium">
              {t('nav.welcome', { username })}
            </Text>
          )}
        </Flex>

        {/* Right side */}
        <HStack spacing={{ base: 1, md: 4 }} flexShrink={0}>
          <Button
            onClick={toggleColorMode}
            variant="ghost"
            size={{ base: 'sm', md: 'md' }}
            minW={{ base: 'auto', md: 'auto' }}
            px={{ base: 2, md: 4 }}
          >
            {colorMode === 'dark' ? '☀️' : '🌙'}
          </Button>

          {isAuthenticated ? (
            <>
              <Button
                colorScheme="yellow"
                variant="outline"
                size={{ base: 'xs', md: 'sm' }}
                fontSize={{ base: 'xs', md: 'sm' }}
                px={{ base: 2, md: 4 }}
                minW={{ base: 'auto', md: 'auto' }}
                onClick={() => { navigateTo(`/${locale}/profile`) }}
              >
                {t('profile.title')}
              </Button>
              <Text display={{ base: 'none', md: 'block' }}>|</Text>
              <Button
                colorScheme="pink"
                size={{ base: 'xs', md: 'sm' }}
                fontSize={{ base: 'xs', md: 'sm' }}
                px={{ base: 2, md: 4 }}
                minW={{ base: 'auto', md: 'auto' }}
                onClick={handleLogout}
              >
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button
                colorScheme="blue"
                variant="outline"
                size={{ base: 'xs', md: 'sm' }}
                fontSize={{ base: 'xs', md: 'sm' }}
                px={{ base: 2, md: 4 }}
                minW={{ base: 'auto', md: 'auto' }}
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
                size={{ base: 'xs', md: 'sm' }}
                fontSize={{ base: 'xs', md: 'sm' }}
                px={{ base: 2, md: 4 }}
                minW={{ base: 'auto', md: 'auto' }}
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
