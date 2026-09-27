'use client';

import { Avatar, Badge, Box, Flex, Heading, HStack, LinkBox, LinkOverlay, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import { useShell } from '@/components/AppShell';
import TierBadge from '@/components/TierBadge';
import { Card, Empty, Loading } from '@/components/ui';
import { api, type TabSummary } from '@/lib/api';
import { ago, firstName, rs } from '@/lib/format';

export default function KhataPage() {
  const { version } = useShell();
  const [tabs, setTabs] = useState<TabSummary[] | null>(null);

  useEffect(() => {
    api<{ tabs: TabSummary[] }>('GET', '/tabs/getAllTabsByUsers').then((d) => setTabs(d.tabs)).catch(() => {});
  }, [version]);

  if (!tabs) return <Loading />;

  return (
    <Stack spacing={6}>
      <Box>
        <Heading as="h1" size="lg">
          Your khata
        </Heading>
        <Text color="gray.600" mt={1}>
          One tab with every friend. Open one to see every receipt between you.
        </Text>
      </Box>
      {tabs.length === 0 ? (
        <Empty emoji="📒" title="No tabs yet.">
          Add a friend to start one.
        </Empty>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {tabs.map((t) => {
            const name = firstName(t.friend.name);
            const line = t.net > 0 ? `${name} owes you ${rs(t.net)}` : t.net < 0 ? `You owe ${name} ${rs(t.net)}` : 'All settled';
            return (
              <LinkBox as={Card} key={t.id} _hover={{ shadow: 'md', borderColor: 'brand.200' }} transition="all 0.15s">
                <Flex gap={4} align="center">
                  <Avatar name={t.friend.name} bg="brand.400" color="white" />
                  <Box flex="1" minW={0}>
                    <LinkOverlay as={NextLink} href={`/tab?id=${t.id}`}>
                      <Text fontWeight="semibold">{t.friend.name}</Text>
                    </LinkOverlay>
                    <TierBadge tier={t.friend.tier} mt={1} />
                  </Box>
                </Flex>
                <Text mt={4} fontSize="lg" fontWeight="bold" color={t.net > 0 ? 'green.600' : t.net < 0 ? 'red.500' : 'gray.500'}>
                  {line}
                </Text>
                <HStack mt={2} spacing={2} wrap="wrap">
                  {t.waiting > 0 && <Badge colorScheme="purple">{t.waiting} need{t.waiting === 1 ? 's' : ''} you</Badge>}
                  {t.overdue > 0 && <Badge colorScheme="red">{t.overdue} overdue</Badge>}
                  <Text fontSize="sm" color="gray.400">
                    {t.receipts} receipt{t.receipts === 1 ? '' : 's'} · {ago(t.lastActivity)}
                  </Text>
                </HStack>
              </LinkBox>
            );
          })}
        </SimpleGrid>
      )}
    </Stack>
  );
}
