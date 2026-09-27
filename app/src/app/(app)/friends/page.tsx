'use client';

import { Avatar, Badge, Box, Button, Flex, FormControl, FormHelperText, Heading, Input, LinkBox, LinkOverlay, SimpleGrid, Stack, Text, useToast } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useShell } from '@/components/AppShell';
import TierBadge from '@/components/TierBadge';
import { Card, Loading } from '@/components/ui';
import { api, ApiError, type TabSummary } from '@/lib/api';

export default function FriendsPage() {
  const { version, refresh } = useShell();
  const toast = useToast();
  const [tabs, setTabs] = useState<TabSummary[] | null>(null);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api<{ tabs: TabSummary[] }>('GET', '/tabs/getAllTabsByUsers').then((d) => setTabs(d.tabs)).catch(() => {});
  }, [version]);

  async function add(e: FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const { tab } = await api<{ tab: { id: number; friend: { name: string } } }>('POST', '/tabs/createTab', { email });
      toast({ title: `${tab.friend.name} is on your khata now.`, status: 'success', position: 'top' });
      setEmail('');
      refresh();
    } catch (err) {
      toast({ title: err instanceof ApiError ? err.message : 'Couldn’t add them. Try again.', status: 'error', position: 'top' });
    } finally {
      setAdding(false);
    }
  }

  if (!tabs) return <Loading />;

  return (
    <Stack spacing={6}>
      <Box>
        <Heading as="h1" size="lg">
          Friends
        </Heading>
        <Text color="gray.600" mt={1}>
          Everyone you keep a khata with.
        </Text>
      </Box>

      <Card as="form" onSubmit={add}>
        <Text fontWeight="semibold" mb={3}>
          Add a friend
        </Text>
        <Flex gap={3} direction={{ base: 'column', sm: 'row' }}>
          <FormControl>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Their email address" required />
            <FormHelperText>They need a Wasuli Bhai account. Adding them opens a tab between you.</FormHelperText>
          </FormControl>
          <Button type="submit" isLoading={adding} flexShrink={0}>
            Add friend
          </Button>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {tabs.map((t) => (
          <LinkBox as={Card} key={t.id} _hover={{ shadow: 'md' }}>
            <Flex gap={4} align="center">
              <Avatar name={t.friend.name} bg="brand.400" color="white" />
              <Box flex="1" minW={0}>
                <Flex align="center" gap={2}>
                  <LinkOverlay as={NextLink} href={`/tab?id=${t.id}`}>
                    <Text fontWeight="semibold">{t.friend.name}</Text>
                  </LinkOverlay>
                  {t.friend.demo && (
                    <Badge colorScheme="gray" fontSize="0.6rem">
                      demo friend
                    </Badge>
                  )}
                </Flex>
                <Text fontSize="sm" color="gray.500" noOfLines={1}>
                  {t.friend.bio}
                </Text>
                <TierBadge tier={t.friend.tier} mt={1} />
              </Box>
            </Flex>
          </LinkBox>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
