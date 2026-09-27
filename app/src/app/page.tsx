'use client';

import { Badge, Box, Button, Container, Flex, Heading, Link, SimpleGrid, Stack, Text, useToast } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TierBadge, { TIERS } from '@/components/TierBadge';
import { Card } from '@/components/ui';
import { ApiError, clearSession, getSession, startTestUser, type Me } from '@/lib/api';

const STEPS = [
  { emoji: '🧾', title: 'Send a receipt', text: 'Paid for dinner? Send each friend a receipt for their share, with a due date.' },
  { emoji: '🤝', title: 'They accept it', text: 'Once they accept, it’s on the khata between you. No more “kitne the?”' },
  { emoji: '✅', title: 'Settle up', text: 'They mark it paid, you confirm. Paying on time builds their reputation.' },
];

export default function Landing() {
  const router = useRouter();
  const toast = useToast();
  const [me, setMe] = useState<Me | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    setMe(getSession()?.user ?? null);
    if (new URLSearchParams(window.location.search).has('expired')) {
      toast({ title: 'Your session ended. Jump back in below.', status: 'info', position: 'top' });
    }
  }, [toast]);

  async function tryIt() {
    setStarting(true);
    try {
      await startTestUser();
      router.push('/dashboard');
    } catch (err) {
      toast({ title: err instanceof ApiError ? err.message : 'Couldn’t start a test user. Try again.', status: 'error', position: 'top' });
      setStarting(false);
    }
  }

  return (
    <Box>
      <Box as="header" bgGradient="linear(to-br, #6441A5, #2a0845)" color="white">
        <Container maxW="5xl" pt={{ base: 10, md: 16 }} pb={{ base: 14, md: 20 }}>
          <Flex align="center" gap={2} mb={{ base: 8, md: 12 }}>
            <Box borderRadius="full" overflow="hidden" w="40px" h="40px" position="relative">
              <Image src="/hqdefault.jpg" alt="" fill style={{ objectFit: 'cover' }} />
            </Box>
            <Text fontWeight="bold" fontSize="xl">
              Wasuli Bhai
            </Text>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 10, md: 14 }} alignItems="center">
            <Stack spacing={6}>
              <Badge alignSelf="flex-start" bg="whiteAlpha.300" color="white" px={3} py={1} borderRadius="full" textTransform="none">
                American System · going Dutch, properly
              </Badge>
              <Heading as="h1" size={{ base: 'xl', md: '2xl' }} lineHeight="1.15">
                Settle up with friends, without the awkward ask.
              </Heading>
              <Text fontSize={{ base: 'md', md: 'lg' }} color="whiteAlpha.900">
                Keep a khata with every friend. Send a receipt for their share, they accept it, pay it, and you confirm. Everyone
                builds a reputation, from Naya Murga to Nawab Sahib.
              </Text>
              {me ? (
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={3}>
                  <Button size="lg" as={NextLink} href="/dashboard" bg="white" color="brand.700" _hover={{ bg: 'brand.50' }}>
                    Continue as {me.name}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    color="white"
                    borderColor="whiteAlpha.600"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={() => {
                      clearSession();
                      setMe(null);
                    }}
                  >
                    Log out
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={3}>
                  <Stack direction={{ base: 'column', sm: 'row' }} spacing={3}>
                    <Button size="lg" onClick={tryIt} isLoading={starting} loadingText="Setting up your khata" bg="white" color="brand.700" _hover={{ bg: 'brand.50' }}>
                      Try it as a test user
                    </Button>
                    <Button size="lg" as={NextLink} href="/login" variant="outline" color="white" borderColor="whiteAlpha.600" _hover={{ bg: 'whiteAlpha.200' }}>
                      Log in
                    </Button>
                  </Stack>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    No sign-up: one click gives you four demo friends and a few weeks of khata.{' '}
                    <Link as={NextLink} href="/register" textDecoration="underline">
                      Or create an account
                    </Link>
                    .
                  </Text>
                </Stack>
              )}
            </Stack>
            <Box position="relative" w="full" aspectRatio={5 / 3} borderRadius="3xl" overflow="hidden" shadow="2xl">
              <Image src="/1647338689295.jpeg" alt="Wasuli Bhai on the phone, collecting what’s owed" fill priority style={{ objectFit: 'cover' }} />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      <Container as="main" maxW="5xl" py={{ base: 12, md: 16 }}>
        <Heading as="h2" size="lg" mb={6}>
          How it works
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          {STEPS.map((s) => (
            <Card key={s.title}>
              <Text fontSize="3xl">{s.emoji}</Text>
              <Heading as="h3" size="sm" mt={3}>
                {s.title}
              </Heading>
              <Text color="gray.600" mt={2}>
                {s.text}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <Heading as="h2" size="lg" mt={14} mb={2}>
          Your reputation
        </Heading>
        <Text color="gray.600" mb={6}>
          Every debt you pay on time counts in full, a late one counts half, and an overdue one counts nothing. Your score puts
          you in a tier that all your friends can see.
        </Text>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
          {TIERS.map((t) => (
            <Card key={t.name} py={4}>
              <Flex justify="space-between" align="center" gap={2}>
                <TierBadge tier={t.name} fontSize="sm" />
                <Text fontSize="sm" color="gray.500">
                  {t.rule}
                </Text>
              </Flex>
              <Text color="gray.600" mt={2} fontSize="sm">
                {t.blurb}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      <Box as="footer" borderTopWidth="1px" py={8}>
        <Container maxW="5xl" fontSize="sm" color="gray.500">
          Wasuli Bhai is the app for American System. Built by{' '}
          <Link href="https://umarkhatana.com" color="brand.600">
            Umar Khatana
          </Link>{' '}
          ·{' '}
          <Link href="https://github.com/0xWick/american-system" color="brand.600">
            Code on GitHub
          </Link>
        </Container>
      </Box>
    </Box>
  );
}
