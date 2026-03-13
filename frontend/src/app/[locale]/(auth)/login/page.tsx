'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Box, VStack, Input, Button, Heading, Text, Link as ChakraLink, useColorMode } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { colorMode } = useColorMode();
  const setToken = useAuthStore((state) => state.setToken);
  const setUsername = useAuthStore((state) => state.setUsername);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // 토큰 저장
      setToken(token);
      setUsername(user.username);
      
      // 로그인 성공 후 피드 페이지로 이동
      router.push(`/${locale}/feed`);
    } catch (err) {
      // 에러 처리: 사용자에게 명확한 메시지 표시
      const error = err as { response?: { status?: number; data?: { error?: string } } };
      console.error('로그인 오류:', err);
      
      if (error.response?.status === 401) {
        setError(t('auth.invalidCredentials') || '이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (error.response?.status === 400) {
        setError(t('auth.missingFields') || '이메일과 비밀번호를 입력해주세요.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError(t('auth.loginFailed') || '로그인에 실패했습니다. 다시 시도해주세요.');
      }
      
      // 리다이렉트 방지: 에러 발생 시 현재 페이지에 머물기
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
            {t('auth.loginTitle')}
          </Heading>

          {error && <Text color="red.500">{error}</Text>}

          <VStack as="form" onSubmit={handleLogin} spacing={4} width="100%">
            <Input
              placeholder={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              placeholder={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" bg="blue.600" color="white" _hover={{ bg: 'blue.700' }} width="100%" isLoading={isLoading}>
              {t('auth.login')}
            </Button>
          </VStack>

          <Text>
            {t('auth.noAccount')}{' '}
            <ChakraLink as={Link} href={`/${locale}/signup`} color="blue.600">
              {t('auth.signup')}
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
