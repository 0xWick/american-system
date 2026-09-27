'use client';

import { Box, Button, CircularProgress, CircularProgressLabel, Flex, Heading, Link, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import { useShell } from '@/components/AppShell';
import ReceiptItem from '@/components/ReceiptItem';
import TierBadge, { tierStyle } from '@/components/TierBadge';
import { Card, Empty, Loading, Section, StatCard } from '@/components/ui';
import { api, type Balance, type Me, type Receipt } from '@/lib/api';
import { ago, explain, firstName, rs } from '@/lib/format';

interface Dashboard {
  me: Me;
  totals: Balance & { friends: number; overdueOwedToMe: number; overdueIOwe: number };
  needsYou: Receipt[];
  recent: Receipt[];
}

export default function DashboardPage() {
  const { version, refresh, newReceipt } = useShell();
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    api<Dashboard>('GET', '/dashboard').then(setData).catch(() => {});
  }, [version]);

  if (!data) return <Loading />;
  const { me, totals, needsYou, recent } = data;

  return (
    <Stack spacing={8}>
      <Card bgGradient="linear(to-br, brand.50, white)">
        <Flex gap={6} align="center" direction={{ base: 'column', sm: 'row' }} textAlign={{ base: 'center', sm: 'left' }}>
          <CircularProgress value={me.score ?? 0} size="96px" thickness="10px" color={`${tierStyle(me.tier).scheme}.400`} trackColor="gray.100">
            <CircularProgressLabel fontWeight="bold" fontSize="xl">
              {me.score ?? '–'}
            </CircularProgressLabel>
          </CircularProgress>
          <Box flex="1">
            <Heading as="h1" size="lg">
              Salam, {firstName(me.name)} 👋
            </Heading>
            <Flex gap={2} mt={2} align="center" justify={{ base: 'center', sm: 'flex-start' }} wrap="wrap">
              <TierBadge tier={me.tier} fontSize="sm" />
              <Text color="gray.600" fontSize="sm">
                {me.tierBlurb}
              </Text>
            </Flex>
            <Text color="gray.500" fontSize="sm" mt={2}>
              {me.score === null ? 'Pay your first receipt to earn a score.' : 'Pay on time to climb. Late payments count half, overdue ones nothing.'}{' '}
              <Link as={NextLink} href="/rankings" color="brand.600" fontWeight="semibold">
                See rankings
              </Link>
            </Text>
          </Box>
          <Button onClick={() => newReceipt()} size="lg" flexShrink={0}>
            + New receipt
          </Button>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
        <StatCard label="Friends owe you" value={rs(totals.owedToMe)} color="green.600" help={totals.overdueOwedToMe ? `${totals.overdueOwedToMe} overdue` : 'Nothing overdue'} />
        <StatCard label="You owe" value={rs(totals.iOwe)} color="red.500" help={totals.overdueIOwe ? `${totals.overdueIOwe} overdue, pay soon` : 'Nothing overdue'} />
        <StatCard label={totals.net >= 0 ? 'You’re up' : 'You’re down'} value={rs(totals.net)} help={`Across ${totals.friends} friend${totals.friends === 1 ? '' : 's'}`} />
      </SimpleGrid>

      <Section title={`Needs you${needsYou.length ? ` (${needsYou.length})` : ''}`}>
        {needsYou.length ? (
          <Stack spacing={3}>
            {needsYou.map((r) => (
              <ReceiptItem key={r.id} r={r} onChanged={refresh} />
            ))}
          </Stack>
        ) : (
          <Empty emoji="🎉" title="You’re all caught up.">
            Nothing to accept, pay or confirm right now.
          </Empty>
        )}
      </Section>

      <Section
        title="Recent activity"
        action={
          <Link as={NextLink} href="/khata" color="brand.600" fontWeight="semibold" fontSize="sm">
            Open your khata →
          </Link>
        }
      >
        <Card p={0} overflow="hidden">
          {recent.map((r, i) => (
            <Flex key={r.id} px={5} py={3} gap={4} align="center" borderTopWidth={i ? '1px' : 0} borderColor="gray.100">
              <Box flex="1" minW={0}>
                <Text fontWeight="medium" noOfLines={1}>
                  {r.title} <Text as="span" color="gray.400" fontWeight="normal">· {r.friend.name}</Text>
                </Text>
                <Text fontSize="sm" color="gray.500" noOfLines={1}>
                  {explain(r)}
                </Text>
              </Box>
              <Box textAlign="right" flexShrink={0}>
                <Text fontWeight="semibold" color={r.direction === 'owed_to_me' ? 'green.600' : 'red.500'}>
                  {r.direction === 'owed_to_me' ? '+' : '−'}
                  {rs(r.amount)}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {ago(r.updatedAt)}
                </Text>
              </Box>
            </Flex>
          ))}
        </Card>
      </Section>
    </Stack>
  );
}
