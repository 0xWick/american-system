'use client';

import { Badge, Box, Button, Flex, HStack, Text, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { api, ApiError, type Action, type Receipt } from '@/lib/api';
import { explain, firstName, rs } from '@/lib/format';

const LABEL: Record<Action, string> = {
  accept: 'Accept',
  reject: 'Reject',
  cancel: 'Cancel',
  pay: 'Mark as paid',
  confirm: 'Confirm I got it',
  pardon: 'Let it go',
};

const DONE: Record<Action, string> = {
  accept: 'Accepted. It’s on your khata now.',
  reject: 'Rejected.',
  cancel: 'Cancelled.',
  pay: 'Marked as paid.',
  confirm: 'Confirmed. All settled.',
  pardon: 'Pardoned. Very generous.',
};

const PRIMARY = new Set<Action>(['accept', 'pay', 'confirm']);

function StatusBadge({ r }: { r: Receipt }) {
  const [label, scheme] =
    r.status === 'Accepted'
      ? r.overdue
        ? ['Overdue', 'red']
        : ['Open', 'purple']
      : ({
          Sent: ['Waiting', 'yellow'],
          Paid: ['Paid, to confirm', 'teal'],
          Confirmed: ['Settled', 'green'],
          Rejected: ['Rejected', 'gray'],
          Cancelled: ['Cancelled', 'gray'],
          Pardoned: ['Pardoned', 'gray'],
        } as const)[r.status];
  return (
    <Badge colorScheme={scheme} variant="subtle" borderRadius="full" px={2} textTransform="none">
      {label}
    </Badge>
  );
}

export default function ReceiptItem({ r, onChanged, showFriend = true }: { r: Receipt; onChanged: () => void; showFriend?: boolean }) {
  const toast = useToast();
  const [busy, setBusy] = useState<Action | null>(null);
  const owed = r.direction === 'owed_to_me';

  async function run(action: Action) {
    setBusy(action);
    try {
      const res = await api<{ receipt: Receipt; reaction?: string }>('PUT', `/receipts/${action}/${r.id}`);
      toast({ title: DONE[action], description: res.reaction, status: 'success', duration: 4000, isClosable: true, position: 'top' });
      onChanged();
    } catch (err) {
      toast({ title: err instanceof ApiError ? err.message : 'Couldn’t do that. Try again.', status: 'error', position: 'top' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <Box bg="white" borderWidth="1px" borderColor={r.overdue ? 'red.200' : 'gray.100'} borderRadius="xl" p={4} shadow="sm">
      <Flex gap={4} justify="space-between" align="flex-start">
        <Box minW={0} flex="1">
          <Text fontWeight="semibold" noOfLines={1}>
            {r.title}
          </Text>
          {showFriend && (
            <Text fontSize="sm" color="gray.500">
              {owed ? `${firstName(r.friend.name)} owes you` : `You owe ${firstName(r.friend.name)}`}
            </Text>
          )}
          <Text fontSize="sm" color="gray.600" mt={1}>
            {explain(r)}
          </Text>
          {r.description && (
            <Text fontSize="sm" color="gray.500" mt={1} fontStyle="italic">
              “{r.description}”
            </Text>
          )}
        </Box>
        <Box textAlign="right" flexShrink={0}>
          <Text fontWeight="bold" fontSize="lg" color={owed ? 'green.600' : 'red.500'}>
            {owed ? '+' : '−'}
            {rs(r.amount)}
          </Text>
          <StatusBadge r={r} />
        </Box>
      </Flex>
      {r.actions.length > 0 && (
        <HStack mt={3} spacing={2} flexWrap="wrap">
          {r.actions.map((a) => (
            <Button
              key={a}
              size="sm"
              variant={PRIMARY.has(a) ? 'solid' : 'outline'}
              colorScheme={PRIMARY.has(a) ? 'brand' : 'gray'}
              isLoading={busy === a}
              isDisabled={busy !== null && busy !== a}
              onClick={() => run(a)}
            >
              {LABEL[a]}
            </Button>
          ))}
        </HStack>
      )}
    </Box>
  );
}
