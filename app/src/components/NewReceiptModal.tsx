'use client';

import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError, type Receipt, type TabSummary } from '@/lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tabId?: number;
  onSent: () => void;
}

export default function NewReceiptModal({ isOpen, onClose, tabId, onSent }: Props) {
  const toast = useToast();
  const [tabs, setTabs] = useState<TabSummary[]>([]);
  const [form, setForm] = useState({ tabId: '', title: '', amount: '', dueInDays: '7', description: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm({ tabId: tabId ? String(tabId) : '', title: '', amount: '', dueInDays: '7', description: '' });
    api<{ tabs: TabSummary[] }>('GET', '/tabs/getAllTabsByUsers')
      .then(({ tabs }) => {
        setTabs(tabs);
        if (!tabId && tabs[0]) setForm((f) => ({ ...f, tabId: String(tabs[0].id) }));
      })
      .catch(() => setTabs([]));
  }, [isOpen, tabId]);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await api<{ receipt: Receipt; reaction?: string }>('POST', '/receipts/send', {
        tabId: Number(form.tabId),
        title: form.title,
        amount: form.amount,
        dueInDays: Number(form.dueInDays),
        description: form.description,
      });
      toast({
        title: `Sent ${res.receipt.friend.name.split(' ')[0]} a receipt.`,
        description: res.reaction,
        status: res.receipt.status === 'Rejected' ? 'warning' : 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      onSent();
      onClose();
    } catch (err) {
      toast({ title: err instanceof ApiError ? err.message : 'Couldn’t send it. Try again.', status: 'error', position: 'top' });
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={submit} mx={4}>
        <ModalHeader>New receipt</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Who owes you?</FormLabel>
              <Select value={form.tabId} onChange={set('tabId')} placeholder={tabs.length ? undefined : 'Add a friend first'}>
                {tabs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.friend.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>What for?</FormLabel>
              <Input value={form.title} onChange={set('title')} maxLength={60} placeholder="Dinner at Monal" />
            </FormControl>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="full">
              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <InputGroup>
                  <InputLeftAddon>Rs</InputLeftAddon>
                  <Input value={form.amount} onChange={set('amount')} inputMode="numeric" pattern="[0-9,]*" placeholder="2,500" />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Due</FormLabel>
                <Select value={form.dueInDays} onChange={set('dueInDays')}>
                  <option value="3">In 3 days</option>
                  <option value="7">In a week</option>
                  <option value="14">In two weeks</option>
                  <option value="30">In a month</option>
                </Select>
              </FormControl>
            </SimpleGrid>
            <FormControl>
              <FormLabel>Note</FormLabel>
              <Textarea value={form.description} onChange={set('description')} maxLength={200} rows={2} placeholder="Your share of the bill" />
              <FormHelperText>They accept it, pay it, and you confirm. Paying on time builds their reputation.</FormHelperText>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" colorScheme="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={sending} isDisabled={!form.tabId}>
            Send receipt
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
