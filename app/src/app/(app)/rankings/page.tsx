'use client';

import { Avatar, Box, Flex, Heading, Progress, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useShell } from '@/components/AppShell';
import TierBadge, { TIERS, tierStyle } from '@/components/TierBadge';
import { Card, Loading } from '@/components/ui';
import { api, type Person } from '@/lib/api';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function RankingsPage() {
  const { version } = useShell();
  const [people, setPeople] = useState<(Person & { you: boolean })[] | null>(null);

  useEffect(() => {
    api<{ rankings: (Person & { you: boolean })[] }>('GET', '/rankings').then((d) => setPeople(d.rankings)).catch(() => {});
  }, [version]);

  if (!people) return <Loading />;

  return (
    <Stack spacing={6}>
      <Box>
        <Heading as="h1" size="lg">
          Rankings
        </Heading>
        <Text color="gray.600" mt={1}>
          Who actually pays, in your circle. On time counts in full, late counts half, overdue counts nothing.
        </Text>
      </Box>

      <Card p={0} overflow="hidden">
        {people.map((p, i) => (
          <Flex key={p.id} px={5} py={4} gap={4} align="center" borderTopWidth={i ? '1px' : 0} borderColor="gray.100" bg={p.you ? 'brand.50' : undefined}>
            <Text w="28px" textAlign="center" fontSize={i < 3 && p.score !== null ? 'xl' : 'md'} fontWeight="bold" color="gray.400">
              {p.score !== null && i < 3 ? MEDALS[i] : i + 1}
            </Text>
            <Avatar name={p.name} size="sm" bg={p.you ? 'brand.600' : 'brand.300'} color="white" />
            <Box flex="1" minW={0}>
              <Text fontWeight="semibold" noOfLines={1}>
                {p.name}
                {p.you && ' (you)'}
              </Text>
              <TierBadge tier={p.tier} />
            </Box>
            <Box w={{ base: '90px', sm: '180px' }} flexShrink={0}>
              <Text textAlign="right" fontWeight="bold">
                {p.score ?? '–'}
              </Text>
              <Progress value={p.score ?? 0} size="sm" borderRadius="full" colorScheme={tierStyle(p.tier).scheme} />
            </Box>
          </Flex>
        ))}
      </Card>

      <Box>
        <Heading as="h2" size="md" mb={3}>
          The tiers
        </Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
          {TIERS.map((t) => (
            <Card key={t.name} py={3}>
              <Flex justify="space-between" align="center">
                <TierBadge tier={t.name} />
                <Text fontSize="sm" color="gray.400">
                  {t.rule}
                </Text>
              </Flex>
              <Text fontSize="sm" color="gray.600" mt={1}>
                {t.blurb}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Box>
    </Stack>
  );
}
