'use client';

import {
  Alert,
  AlertDescription,
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { clearSession, getSession, type Me } from '@/lib/api';
import NewReceiptModal from './NewReceiptModal';

interface Shell {
  me: Me;
  /** Bumps after anything changes, so pages refetch. */
  version: number;
  refresh: () => void;
  newReceipt: (tabId?: number) => void;
}

const ShellContext = createContext<Shell | null>(null);
export const useShell = () => useContext(ShellContext)!;

const NAV = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/khata', label: 'Khata', icon: '📒' },
  { href: '/rankings', label: 'Rankings', icon: '🏆' },
  { href: '/friends', label: 'Friends', icon: '👥' },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [version, setVersion] = useState(0);
  const [tabId, setTabId] = useState<number | undefined>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const session = getSession();
    if (!session) router.replace('/');
    else setMe(session.user);
  }, [router]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  const newReceipt = useCallback(
    (id?: number) => {
      setTabId(id);
      onOpen();
    },
    [onOpen],
  );

  function logout() {
    clearSession();
    router.replace('/');
  }

  if (!me) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );
  }

  return (
    <ShellContext.Provider value={{ me, version, refresh, newReceipt }}>
      <Box as="header" bgGradient="linear(to-r, #6441A5, #2a0845)" color="white" position="sticky" top={0} zIndex={10} shadow="md">
        <Container maxW="5xl" py={3}>
          <Flex align="center" gap={4}>
            <HStack as={NextLink} href="/dashboard" spacing={2} flexShrink={0}>
              <Box borderRadius="full" overflow="hidden" w="36px" h="36px" position="relative">
                <Image src="/hqdefault.jpg" alt="" fill style={{ objectFit: 'cover' }} />
              </Box>
              <Text fontWeight="bold" fontSize="lg">
                Wasuli Bhai
              </Text>
            </HStack>
            <HStack as="nav" spacing={1} display={{ base: 'none', md: 'flex' }} flex="1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  as={NextLink}
                  href={n.href}
                  px={3}
                  py={1.5}
                  borderRadius="md"
                  fontWeight="medium"
                  bg={path.startsWith(n.href) ? 'whiteAlpha.300' : undefined}
                  _hover={{ bg: 'whiteAlpha.200', textDecoration: 'none' }}
                >
                  {n.label}
                </Link>
              ))}
            </HStack>
            <HStack spacing={3} ml="auto">
              <Button onClick={() => newReceipt()} bg="white" color="brand.700" _hover={{ bg: 'brand.50' }} size="sm">
                + New receipt
              </Button>
              <Menu placement="bottom-end">
                <MenuButton aria-label="Account">
                  <Avatar name={me.name} size="sm" bg="brand.300" color="white" />
                </MenuButton>
                <MenuList color="gray.800">
                  <MenuItem as={NextLink} href="/profile">
                    Profile
                  </MenuItem>
                  <MenuItem onClick={logout}>Log out</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {me.testUser && (
        <Alert status="info" variant="subtle" justifyContent="center" py={2} fontSize="sm">
          <AlertDescription textAlign="center">
            You’re exploring as a test user. Hina, Ali, Sana and Bilal are demo friends who answer instantly.{' '}
            <Link as={NextLink} href="/register" fontWeight="semibold" textDecoration="underline">
              Create a real account
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Container as="main" maxW="5xl" py={{ base: 5, md: 8 }} pb={{ base: 24, md: 10 }}>
        {children}
      </Container>

      <HStack
        as="nav"
        display={{ base: 'flex', md: 'none' }}
        position="fixed"
        bottom={0}
        insetX={0}
        bg="white"
        borderTopWidth="1px"
        justify="space-around"
        py={2}
        zIndex={10}
      >
        {NAV.map((n) => (
          <Link key={n.href} as={NextLink} href={n.href} textAlign="center" fontSize="xs" color={path.startsWith(n.href) ? 'brand.600' : 'gray.500'} fontWeight="semibold" _hover={{ textDecoration: 'none' }}>
            <Text fontSize="xl" lineHeight="1.2">
              {n.icon}
            </Text>
            {n.label}
          </Link>
        ))}
      </HStack>

      <NewReceiptModal isOpen={isOpen} onClose={onClose} tabId={tabId} onSent={refresh} />
    </ShellContext.Provider>
  );
}
