import { Box, Flex, Heading, Spinner, Stat, StatHelpText, StatLabel, StatNumber, Text, type BoxProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export const Card = (props: BoxProps) => <Box bg="white" borderWidth="1px" borderColor="gray.100" borderRadius="2xl" p={5} shadow="sm" {...props} />;

export function Loading() {
  return (
    <Flex py={20} justify="center">
      <Spinner color="brand.500" size="lg" />
    </Flex>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Box as="section">
      <Flex align="center" justify="space-between" mb={3} gap={3}>
        <Heading as="h2" size="md">
          {title}
        </Heading>
        {action}
      </Flex>
      {children}
    </Box>
  );
}

export function Empty({ emoji, title, children }: { emoji: string; title: string; children?: ReactNode }) {
  return (
    <Card textAlign="center" py={8}>
      <Text fontSize="3xl">{emoji}</Text>
      <Text fontWeight="semibold" mt={2}>
        {title}
      </Text>
      {children && (
        <Text color="gray.500" fontSize="sm" mt={1}>
          {children}
        </Text>
      )}
    </Card>
  );
}

export function StatCard({ label, value, help, color }: { label: string; value: string; help?: string; color?: string }) {
  return (
    <Card>
      <Stat>
        <StatLabel color="gray.500">{label}</StatLabel>
        <StatNumber color={color} fontSize="2xl">
          {value}
        </StatNumber>
        {help && <StatHelpText mb={0}>{help}</StatHelpText>}
      </Stat>
    </Card>
  );
}
