import { VStack, Box, Input, Heading, Text, Flex, Button } from "@chakra-ui/react";

const Connections = () => {
  return (
    <VStack spacing={8} alignItems="stretch" p={4} w="full">
      {/* Search Bar */}
    
      {/* Title */}
      <Heading as="h2" size="lg" color="purple.600">
        Connections
      </Heading>

      {/* No Connections Message */}
      <VStack 
        spacing={4} 
        alignItems="center" 
        justifyContent="center" 
        p={8} 
        borderWidth={1} 
        borderRadius={8} 
        boxShadow="md" 
        bg="white"
      >
          <Box>
        <Input 
          placeholder="Search connections..." 
          size="lg" 
          borderColor="purple.300" 
          focusBorderColor="purple.500" 
        />
      </Box>

        <Text fontSize="lg" color="gray.600">
          There are no connections.
        </Text>
        <Text fontSize="md" color="gray.500">
          Want to make one? Click below.
        </Text>
        <Button colorScheme="purple" size="md">
          Add Connection
        </Button>
      </VStack>
    </VStack>
  );
};

export default Connections;
