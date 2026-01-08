import { getTranslations } from 'next-intl/server';
import { Box, Heading, Button, VStack } from '@chakra-ui/react';
import Link from 'next/link';

export default async function Home() {
  const t = await getTranslations();

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, blue.400, purple.500)"
    >
      <VStack spacing={8} textAlign="center">
        <Heading as="h1" size="2xl" color="white">
          🐾 Pet Community
        </Heading>
        <Heading as="h2" size="lg" color="white" fontWeight="normal">
          Share your pet's daily journey
        </Heading>
        <VStack spacing={4}>
          <Link href="/login">
            <Button colorScheme="whiteAlpha" size="lg">
              {t('auth.login')}
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" colorScheme="white" size="lg">
              {t('auth.signup')}
            </Button>
          </Link>
        </VStack>
      </VStack>
    </Box>
  );
}
