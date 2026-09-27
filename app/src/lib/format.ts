import type { Receipt } from './api';

const DAY = 86_400_000;

export const rs = (amount: number) => `Rs ${Math.abs(amount).toLocaleString('en-US')}`;

export const firstName = (name: string) => name.split(' ')[0];

export function day(ts: number) {
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function ago(ts: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86_400) return `${Math.round(s / 3600)} h ago`;
  const d = Math.round(s / 86_400);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

function dueIn(ts: number, now = Date.now()) {
  const d = Math.round((ts - now) / DAY);
  if (d === 0) return 'today';
  if (d > 0) return d === 1 ? 'tomorrow' : `in ${d} days`;
  return `${-d} day${d === -1 ? '' : 's'} ago`;
}

/** One line on where a receipt stands, from the reader's side. */
export function explain(r: Receipt) {
  const them = firstName(r.friend.name);
  const owed = r.direction === 'owed_to_me';
  switch (r.status) {
    case 'Sent':
      return owed ? `Waiting for ${them} to accept.` : `${them} asked you for this. Accept or reject it.`;
    case 'Accepted':
      if (r.overdue) return owed ? `${them} was due to pay ${dueIn(r.dueAt)}.` : `You were due to pay ${dueIn(r.dueAt)}.`;
      return owed ? `${them} agreed to pay, due ${dueIn(r.dueAt)}.` : `You agreed to pay, due ${dueIn(r.dueAt)}.`;
    case 'Paid':
      return owed ? `${them} says it’s paid. Confirm once you have it.` : `You marked it paid. Waiting for ${them} to confirm.`;
    case 'Confirmed':
      return `Settled ${day(r.settledAt ?? r.updatedAt)}${r.paidAt && r.paidAt > r.dueAt ? ', paid late' : ', on time'}.`;
    case 'Rejected':
      return owed ? `${them} rejected it.` : 'You rejected it.';
    case 'Cancelled':
      return owed ? 'You cancelled it.' : `${them} cancelled it.`;
    case 'Pardoned':
      return owed ? `You let ${them} off.` : `${them} let you off. Shukriya!`;
  }
}
