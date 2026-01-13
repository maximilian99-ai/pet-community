'use client';

import { useTranslations } from 'next-intl';
import { Box, VStack, Card, CardBody, Heading, SimpleGrid, useColorMode } from '@chakra-ui/react';
import { Navbar } from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const t = useTranslations();
  const { colorMode } = useColorMode();

  return (
    <Box>
      <Navbar />
      <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'} p={{ base: 4, md: 8 }}>
        <VStack spacing={8} maxW="1200px" mx="auto" align="stretch">
          <Heading size="lg">{t('dashboard.title')}</Heading>

          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            {[
              { label: t('dashboard.feeding'), value: '5' },
              { label: t('dashboard.walks'), value: '3' },
              { label: t('dashboard.health'), value: '100%' },
              { label: 'Posts', value: '12' },
            ].map((stat, idx) => (
              <Card key={idx} bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
                <CardBody textAlign="center">
                  <Heading size="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                    {stat.label}
                  </Heading>
                  <Heading size="xl" mt={2}>
                    {stat.value}
                  </Heading>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Weekly Health Chart */}
          <Card bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
            <CardBody>
              <Heading size="md" mb={4}>
                {t('dashboard.weeklyHealth')}
              </Heading>
              <Box height="300px" bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'} borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                Chart Component will be placed here
              </Box>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
}
