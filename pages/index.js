// * Use Chakra UI for styling
import { Box, Button, Card, Heading, Input, Text } from "@chakra-ui/react";

import NextLink from "next/link";

// * Use React Hooks for state management
import { useState } from "react";


export default function Login() {

  // Manage state of the form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Send data to the backend
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  };

  return (
    // Background Box
    <Box
      h="100vh"
      w="100vw"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="green.400"
      zIndex={-2}
      position={"absolute"}
    >
      
      {/* Content Box */}
      <Box
        w="50%"
        h="100%"
        flex={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDir="column"
        bg="transparent"
      >
        {/* Logo & Heading Box */}
        <Box
          marginTop="-20"
          display="flex"
          flexBasis="33%"
          alignItems="center"
          justifyContent="center"
          flexDir="column"
          height="100%"
          width="100%"
        >
          {/* Logo Image */}
          <Box
            sx={{
              backgroundImage: "url('/AmericanSystem.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
            width="300px"
            height="300px"
            marginBottom="3"
            
          ></Box>
          
        </Box>

        {/* Form Box */}

        <Box
          w="40%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDir="column"
          marginBottom="0"
          bg="transparent"
        >
          {/* Form inside a Card */}
          <Text 
          fontSize="2xl"
          fontStyle={"italic"}
          marginBottom="5"
          marginTop="10"
          color="lawngreen"
          border="2px solid white"
          borderRadius="8px"
          paddingX="10px"
          >Join the Social Network of Paisa Conscious People! </Text>
          <Card
            width="100%"
            padding="20px"
            boxShadow="0px 5px 10px #919191"
            borderRadius="11px"
            border="none"
            
          >
            <Heading size="md" marginBottom="2" color="teal.600">
              Email
            </Heading>
            <Input
              placeholder="Enter your email"
              size="md"
              width="100%"
              marginBottom="5"
              borderColor="green.400"
            />
            <Heading size="md" marginBottom="2" color="teal.600">
              Password
            </Heading>
            <Input
              placeholder="Password"
              size="md"
              width="100%"
              variant="filled"
              marginBottom="2"
            />
          </Card>
        </Box>
        
        {/* Buttons Box */}
        <Box
          marginTop={20}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDir="column"
          width="30%"
        >
          <Button size="lg" variant="solid" colorScheme="teal" marginY={10} width="100%" >
            Sign In
          </Button>

 
            <NextLink href="/signup" passHref legacyBehavior>
              <Button as="a" size="lg" variant="solid" colorScheme="whatsapp"  width="100%" border="1px" borderColor="green.300" borderRadius="8px" >
                Sign Up
              </Button>
            </NextLink>


        </Box>
      </Box>
      
      {/* Image position on left */}
      <Box
        // Posotion Left
       sx={{
        backgroundImage: "url('/HomeNoBG.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "40%",
        width: "20%",
        
      }}
      position="absolute" right={0} bottom={0} zIndex={-1}
 
      
      ></Box>

      

    </Box>
  );
}
