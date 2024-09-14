
       



import { Button, FormControl, FormLabel, Input, VStack, Flex, Box, Text } from "@chakra-ui/react";
import Image from "next/image";

const LoginPage = () => (
  <Flex 
    height="100vh" 
    alignItems="center" 
    justifyContent="center"
    bgGradient="linear(to-r, #6441A5, #2a0845)"
  >
    <Box 
      p={8} 
      maxWidth="400px" 
      borderWidth={1} 
      borderRadius={8} 
      boxShadow="lg"
      bg="white"
      borderColor="purple.200"
    >
      <Image src="/hqdefault.jpg" alt="Wasuli Bhai"  width={350} height={60}/>

      <Text fontSize="xl" mb={6} color="purple.500" fontWeight="bold" textAlign="center">Wasuli Bhai</Text>
      <VStack spacing={4}>
        <FormControl id="email">
          <FormLabel color="purple.600">Email address</FormLabel>
          <Input type="email" borderColor="purple.300" focusBorderColor="purple.500" />
        </FormControl>
        <FormControl id="password">
          <FormLabel color="purple.600">Password</FormLabel>
          <Input type="password" borderColor="purple.300" focusBorderColor="purple.500" />
        </FormControl>
        <Button colorScheme="purple" width="full">Login</Button>
      </VStack>
    </Box>
  </Flex>
);

export default LoginPage;
