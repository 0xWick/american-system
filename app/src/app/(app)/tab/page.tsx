'use client';

import { Avatar, Box, Button, ButtonGroup, Flex, Heading, Link, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import { useShell } from '@/components/AppShell';
import ReceiptItem from '@/components/ReceiptItem';
import TierBadge from '@/components/TierBadge';
import { Card, Empty, Loading, StatCard } from '@/components/ui';
import { api, ApiError, type Balance, type Person, type Receipt } from '@/lib/api';
import { firstName, rs } from '@/lib/format';

type Filter = 'open' | 'all';
const OPEN = new Set(['Sent', 'Accepted', 'Paid']);

export default function TabPage() {
  const { version, refresh, newReceipt } = useShell();
  const [id, setId] = useState<number | null>(null);
  const [data, setData] = useState<{ tab: Balance & { id: number; friend: Person }; receipts: Receipt[] } | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('open');

  useEffect(() => setId(Number(new URLSearchParams(window.location.search).get('id')) || null), []);

  useEffect(() => {
    if (!id) return;
    api<typeof data>('GET', `/tabs/${id}`)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Couldn’t load this tab.'));
  }, [id, version]);

  if (error) return <Empty emoji="🤷" title={error}>Go back to your <Link as={NextLink} href="/khata" color="brand.600">khata</Link>.</Empty>;
  if (!data) return <Loading />;
  const { tab, receipts } = data;
  const name = firstName(tab.friend.name);
  const shown = filter === 'open' ? receipts.filter((r) => OPEN.has(r.status)) : receipts;

  return (
    <Stack spacing={6}>
      <Link as={NextLink} href="/khata" color="gray.500" fontSize="sm">
        ← Khata
      </Link>
      <Card>
        <Flex gap={4} align="center" wrap="wrap">
          <Avatar name={tab.friend.name} size="lg" bg="brand.400" color="white" />
          <Box flex="1" minW="200px">
            <Heading as="h1" size="lg">
              {tab.friend.name}
            </Heading>
            <Flex gap={2} mt={1} align="center" wrap="wrap">
              <TierBadge tier={tab.friend.tier} />
              <Text fontSize="sm" color="gray.500">
                {tab.friend.score === null ? 'No record yet' : `Score ${tab.friend.score}`} · {tab.friend.bio}
              </Text>
            </Flex>
          </Box>
          <Button onClick={() => newReceipt(tab.id)}>+ Receipt for {name}</Button>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
        <StatCard label={`${name} owes you`} value={rs(tab.owedToMe)} color="green.600" />
        <StatCard label={`You owe ${name}`} value={rs(tab.iOwe)} color="red.500" />
        <StatCard label="Balance" value={tab.net === 0 ? 'Settled' : rs(tab.net)} help={tab.net > 0 ? `In your favour` : tab.net < 0 ? `In ${name}’s favour` : 'Nothing open'} />
      </SimpleGrid>

      <Box>
        <Flex justify="space-between" align="center" mb={3}>
          <Heading as="h2" size="md">
            Receipts
          </Heading>
          <ButtonGroup size="sm" isAttached variant="outline" colorScheme="gray">
            <Button isActive={filter === 'open'} onClick={() => setFilter('open')}>
              Open
            </Button>
            <Button isActive={filter === 'all'} onClick={() => setFilter('all')}>
              All ({receipts.length})
            </Button>
          </ButtonGroup>
        </Flex>
        {shown.length ? (
          <Stack spacing={3}>
            {shown.map((r) => (
              <ReceiptItem key={r.id} r={r} onChanged={refresh} showFriend={false} />
            ))}
          </Stack>
        ) : (
          <Empty emoji="✨" title="Nothing open with this friend.">
            Everything between you is settled.
          </Empty>
        )}
      </Box>
    </Stack>
  );
}
