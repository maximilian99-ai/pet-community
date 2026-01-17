'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Box, VStack, Input, Button, Heading, Text, Link as ChakraLink, useColorMode } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { colorMode } = useColorMode();
  const setToken = useAuthStore((state) => state.setToken);
  const setUsernameStore = useAuthStore((state) => state.setUsername);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/signup', {
        email,
        username,
        password,
      });
      const { token, user } = response.data;
      setToken(token);
      setUsernameStore(user.username);
      router.push(`/${locale}/feed`);
    } catch (err) {
      interface ErrorResponse {
        response?: { data?: { error?: string } };
      }
      const error = err as ErrorResponse;
      const errorMessage = error.response?.data?.error || 'Signup failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
        <VStack
          spacing={6}
          width={{ base: '90%', sm: '400px' }}
          p={8}
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          borderRadius="lg"
          boxShadow="md"
        >
          <Heading as="h1" size="lg">
            {t('auth.signupTitle')}
          </Heading>

          {error && <Text color="red.500">{error}</Text>}

          <VStack as="form" onSubmit={handleSignup} spacing={4} width="100%">
            <Input
              placeholder={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              placeholder={t('auth.username')}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              placeholder={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              placeholder={t('auth.confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" colorScheme="blue" width="100%" isLoading={isLoading}>
              {t('auth.signup')}
            </Button>
          </VStack>

          <Text>
            {t('auth.haveAccount')}{' '}
            <ChakraLink as={Link} href={`/${locale}/login`} color="blue.500">
              {t('auth.login')}
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
