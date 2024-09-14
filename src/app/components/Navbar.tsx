import { Box, Flex, Link, Spacer, Button, HStack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import Image from "next/image";

const Navbar = () => (
  <Flex 
    as="nav" 
    alignItems="center" 
    justifyContent="space-between" 
    padding="1rem 2rem"
    bgGradient="linear(to-r, #6441A5, #2a0845)"
    color="white"
  >
    <HStack spacing="2">
      <Image src="/hqdefault.jpg" alt="Wasuli Bhai" width={50} height={30} />
      <Text fontSize="xl" fontWeight="bold">Wasuli Bhai</Text>
    </HStack>
    <HStack spacing="4">
      <NextLink href="/" passHref>
        <Link>Home</Link>
      </NextLink>
      <NextLink href="/dashboard" passHref>
        <Link>Dashboard</Link>
      </NextLink>
      <NextLink href="/profile" passHref>
        <Link>Profile</Link>
      </NextLink>
      <Button variant="outline" color="white" borderColor="whiteAlpha.500" _hover={{ bg: "whiteAlpha.200" }}>
        Logout
      </Button>
    </HStack>
  </Flex>
);

export default Navbar;
