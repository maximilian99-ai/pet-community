'use client';

import { useTranslations } from 'next-intl';
import { useColorMode, Box, VStack, Card, CardBody, Heading, Text, Button, HStack } from '@chakra-ui/react';
import { Navbar } from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default function FeedPage() {
  const t = useTranslations();
  const { colorMode } = useColorMode();

  return (
    <Box>
      <Navbar />
      <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'} p={{ base: 4, md: 8 }}>
        <VStack spacing={6} maxW="800px" mx="auto">
          <Heading>{t('feed.title')}</Heading>

          {/* New Post Card */}
          <Card width="100%" bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
            <CardBody>
              <Text>{t('feed.newPost')}</Text>
              <Button colorScheme="blue" mt={4}>
                {t('feed.post')}
              </Button>
            </CardBody>
          </Card>

          {/* Feed Posts */}
          <VStack spacing={4} width="100%">
            {/* Sample Post */}
            <Card width="100%" bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
              <CardBody>
                <Heading size="sm" mb={2}>
                  Post Title
                </Heading>
                <Text mb={4}>Post content will appear here...</Text>
                <HStack spacing={4}>
                  <Button size="sm" variant="ghost">
                    ❤️ {t('feed.like')}
                  </Button>
                  <Button size="sm" variant="ghost">
                    💬 {t('feed.comment')}
                  </Button>
                  <Button size="sm" variant="ghost">
                    🔄 {t('feed.share')}
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}
