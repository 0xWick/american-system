// Provider.js
"use client";
import React, { ReactNode } from "react";
import { ChakraProvider } from "@chakra-ui/react";

interface Props {
  children: ReactNode;
}

function Provider({ children }: Props) {
  return (
          <ChakraProvider>
           {children}
          </ChakraProvider>
  );
}

export default Provider;
