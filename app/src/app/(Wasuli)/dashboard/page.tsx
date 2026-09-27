import Connections from "@/app/components/Connections";
import { Box, Text, SimpleGrid, VStack, HStack, Flex, Button } from "@chakra-ui/react";
import Image from "next/image";

const DashboardPage = () => (
  <Flex height="80vh" alignItems="center" justifyContent="center" bgGradient="linear(to-r, #C4E0E5, #4CA1AF)">
    <VStack spacing={8} p={4} width="full" maxWidth="900px">
      {/* <Heading>Welcome to Wasuli Bhai Dashboard</Heading> */}
      <Image src="/1647338689295.jpeg" alt="Wasuli Bhai" width={500} height={300} className="rounded-[30px]" />
      <SimpleGrid columns={{ sm: 1, md: 3 }} spacing={8}>
        <Box  
          p={6} 
          borderWidth={1} 
          borderRadius={8} 
          boxShadow="md" 
          bg="white"
        >
          <HStack spacing={4}>
            <Box>
              <Text fontSize="3xl" fontWeight="bold">Pending Khata</Text>
            </Box>
          </HStack>
        </Box>

        <Box 
          p={6} 
          borderWidth={1} 
          borderRadius={8} 
          boxShadow="md" 
          bg="white"
        >
          <HStack spacing={4}>
            <Box>
              <Text fontSize="3xl" fontWeight="bold">Total Rankings</Text>
            </Box>
          </HStack>
        </Box>

        <Box 
          p={6} 
          borderWidth={1} 
          borderRadius={8} 
          boxShadow="md" 
          bg="white"
        >
          <HStack spacing={4}>
            <Box>
              <Text fontSize="3xl" fontWeight="bold">New Receipt</Text>
            </Box>
          </HStack>
        </Box>
      </SimpleGrid>

      <Flex justifyContent="center" w="full" mt={8}>
        <Button colorScheme="purple" size="lg">Generate Report</Button>
      </Flex>
      {/* <Connections /> */}
    </VStack>
  </Flex>
);

export default DashboardPage;
