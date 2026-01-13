import { Box, Heading, Button, VStack } from '@chakra-ui/react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, gray.100, gray.200)"
    >
      <VStack spacing={6} textAlign="center">
        <Heading as="h1" size="2xl" color="gray.800">
          404
        </Heading>
        <Heading as="h2" size="lg" color="gray.600">
          Page Not Found
        </Heading>
        <Link href="/en">
          <Button colorScheme="blue" size="lg">
            Go back home
          </Button>
        </Link>
      </VStack>
    </Box>
  );
}
