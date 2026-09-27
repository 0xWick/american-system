'use client';

import { Alert, AlertDescription, Avatar, Box, Button, Flex, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useShell } from '@/components/AppShell';
import TierBadge from '@/components/TierBadge';
import { Card, Loading, StatCard } from '@/components/ui';
import { api, clearSession, type Balance, type Me } from '@/lib/api';
import { day, rs } from '@/lib/format';

interface Profile {
  user: Me & { joinedAt: number };
  stats: Balance & { friends: number; sent: number; received: number; paidOnTime: number; paidLate: number };
}

export default function ProfilePage() {
  const { version } = useShell();
  const router = useRouter();
  const [data, setData] = useState<Profile | null>(null);

  useEffect(() => {
    api<Profile>('GET', '/users/profile').then(setData).catch(() => {});
  }, [version]);

  if (!data) return <Loading />;
  const { user, stats } = data;

  return (
    <Stack spacing={6}>
      <Card>
        <Flex gap={5} align="center" wrap="wrap">
          <Avatar name={user.name} size="xl" bg="brand.500" color="white" />
          <Box flex="1">
            <Heading as="h1" size="lg">
              {user.name}
            </Heading>
            <Text color="gray.500">{user.testUser ? 'Test user' : user.email}</Text>
            <Flex gap={2} mt={2} align="center" wrap="wrap">
              <TierBadge tier={user.tier} fontSize="sm" />
              <Text fontSize="sm" color="gray.600">
                {user.score === null ? 'No record yet.' : `Score ${user.score} of 100.`} {user.tierBlurb}
              </Text>
            </Flex>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Joined {day(user.joinedAt)}
            </Text>
          </Box>
        </Flex>
      </Card>

      {user.testUser && (
        <Alert status="info" borderRadius="xl">
          <AlertDescription>
            Test users and their demo friends are cleared after a day. Create an account to keep a real khata.{' '}
            <Button as={NextLink} href="/register" size="sm" ml={2}>
              Create account
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
        <StatCard label="Friends" value={String(stats.friends)} />
        <StatCard label="Paid on time" value={String(stats.paidOnTime)} color="green.600" />
        <StatCard label="Paid late" value={String(stats.paidLate)} color="orange.500" />
        <StatCard label="Receipts sent" value={String(stats.sent)} />
        <StatCard label="Receipts received" value={String(stats.received)} />
        <StatCard label="Open balance" value={rs(stats.net)} color={stats.net >= 0 ? 'green.600' : 'red.500'} help={stats.net >= 0 ? 'Owed to you' : 'You owe'} />
      </SimpleGrid>

      <Button
        alignSelf="flex-start"
        variant="outline"
        colorScheme="gray"
        onClick={() => {
          clearSession();
          router.replace('/');
        }}
      >
        Log out
      </Button>
    </Stack>
  );
}
