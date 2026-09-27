// Reputation: how reliably someone pays what they agreed to pay.

export type Status = 'Sent' | 'Cancelled' | 'Rejected' | 'Accepted' | 'Paid' | 'Confirmed' | 'Pardoned';

/** A receipt where this person is the one who owes. */
export interface Debt {
  status: Status;
  due_at: number;
  paid_at: number | null;
}

export const TIERS = [
  { name: 'Nawab Sahib', min: 100, blurb: 'Pays every time, on time.' },
  { name: 'Malik Riaz Jr', min: 80, blurb: 'Almost always on time.' },
  { name: 'Kar len ge bro', min: 50, blurb: 'Gets there, eventually.' },
  { name: 'Mufta', min: 30, blurb: 'Enjoys the treat, forgets the bill.' },
  { name: 'Karzai', min: 0, blurb: 'Owes half the city.' },
] as const;

export const NEWCOMER = { name: 'Naya Murga', min: -1, blurb: 'New here. No record yet.' } as const;

export type Tier = (typeof TIERS)[number] | typeof NEWCOMER;

/**
 * Out of 100. A debt paid by its due date counts fully, a late one counts half, and one
 * that's past due and still unpaid counts zero. Debts not yet due, rejected, cancelled or
 * pardoned don't count. Null until there's at least one debt to judge.
 */
export function creditScore(debts: Debt[], now = Date.now()): number | null {
  let points = 0;
  let counted = 0;
  for (const d of debts) {
    if (d.status === 'Paid' || d.status === 'Confirmed') {
      counted++;
      points += d.paid_at !== null && d.paid_at <= d.due_at ? 1 : 0.5;
    } else if (d.status === 'Accepted' && d.due_at < now) {
      counted++;
    }
  }
  return counted ? Math.round((100 * points) / counted) : null;
}

export function tierFor(score: number | null): Tier {
  if (score === null) return NEWCOMER;
  return TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
}
