'use client';

import { Box, Button, Divider, Flex, FormControl, FormLabel, Heading, Input, Link, Stack, Text, useToast } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api, ApiError, saveSession, startTestUser, type Session } from '@/lib/api';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState<'form' | 'test' | null>(null);
  const register = mode === 'register';

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy('form');
    try {
      const session = await api<Session>('POST', register ? '/users' : '/users/login', register ? form : { email: form.email, password: form.password });
      saveSession(session);
      router.push('/dashboard');
    } catch (err) {
      toast({ title: err instanceof ApiError ? err.message : 'Something went wrong. Try again.', status: 'error', position: 'top' });
      setBusy(null);
    }
  }

  async function tryIt() {
    setBusy('test');
    try {
      await startTestUser();
      router.push('/dashboard');
    } catch (err) {
      toast({ title: err instanceof ApiError ? err.message : 'Couldn’t start a test user.', status: 'error', position: 'top' });
      setBusy(null);
    }
  }

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Flex minH="100vh" align="center" justify="center" bgGradient="linear(to-br, #6441A5, #2a0845)" p={4}>
      <Box as="form" onSubmit={submit} bg="white" borderRadius="2xl" shadow="2xl" p={{ base: 6, md: 8 }} w="full" maxW="420px">
        <Flex as={NextLink} href="/" align="center" gap={2} mb={6}>
          <Box borderRadius="full" overflow="hidden" w="36px" h="36px" position="relative">
            <Image src="/hqdefault.jpg" alt="" fill style={{ objectFit: 'cover' }} />
          </Box>
          <Text fontWeight="bold" color="brand.700">
            Wasuli Bhai
          </Text>
        </Flex>
        <Heading as="h1" size="lg" mb={1}>
          {register ? 'Create your account' : 'Welcome back'}
        </Heading>
        <Text color="gray.500" mb={6}>
          {register ? 'Start a khata with your friends.' : 'Log in to your khata.'}
        </Text>
        <Stack spacing={4}>
          {register && (
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={form.name} onChange={set('name')} maxLength={40} autoComplete="name" />
            </FormControl>
          )}
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={form.password} onChange={set('password')} minLength={register ? 8 : undefined} autoComplete={register ? 'new-password' : 'current-password'} />
          </FormControl>
          <Button type="submit" size="lg" isLoading={busy === 'form'} isDisabled={busy === 'test'}>
            {register ? 'Create account' : 'Log in'}
          </Button>
        </Stack>
        <Flex align="center" gap={3} my={5}>
          <Divider />
          <Text fontSize="sm" color="gray.400">
            or
          </Text>
          <Divider />
        </Flex>
        <Button w="full" variant="outline" onClick={tryIt} isLoading={busy === 'test'} isDisabled={busy === 'form'}>
          Try it as a test user
        </Button>
        <Text fontSize="sm" color="gray.500" textAlign="center" mt={5}>
          {register ? 'Already have an account? ' : 'New here? '}
          <Link as={NextLink} href={register ? '/login' : '/register'} color="brand.600" fontWeight="semibold">
            {register ? 'Log in' : 'Create an account'}
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}
