import { ReactNode } from "react";
import Navbar from "../../components/Navbar";
import { Box } from "@chakra-ui/react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box minHeight="100vh" bgGradient="linear(to-r, #C4E0E5, #4CA1AF)">
      <Navbar />
      <Box as="main" p={4}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
