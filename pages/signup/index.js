// Use Chakra UI for styling
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";

import Link from "next/link";

export default function Login() {
  return (
    <Flex
        h="100vh"
        w="100vw"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDir="column"
        bg="green.400"
        zIndex={-2}
        position={"absolute"}
    >
      <Box 
       color="white"
      >
        Hi from Sign Up
        </Box>
        <Link href="/"
        >  

        <Button 
            margin="10"
            colorScheme="teal"
            variant="solid"

        >Go to Home</Button>


        </Link>
      
    </Flex>
  );
}
