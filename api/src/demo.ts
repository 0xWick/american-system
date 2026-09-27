// The test user's world: four friends with their own habits, and a few weeks of khata
// between them, so every screen has something real on it from the first click.

import type { Status } from './score';

const DAY = 86_400_000;

export const PERSONAS = {
  hina: { name: 'Hina Tariq', bio: 'Settles before you even ask.', limit: 50_000 },
  ali: { name: 'Ali Raza', bio: 'Cricket on weekends, pays by Monday.', limit: 50_000 },
  sana: { name: 'Sana Malik', bio: 'Just joined. Organises every dinner.', limit: 50_000 },
  bilal: { name: 'Bilal Ahmed', bio: '"Bhai, next week pakka."', limit: 5_000 },
} as const;

export type Persona = keyof typeof PERSONAS;

const firstName = (p: Persona) => PERSONAS[p].name.split(' ')[0];

/** A demo friend's answer to a receipt you send them. */
export function reaction(persona: Persona, amount: number): { accept: boolean; line: string } {
  if (amount > PERSONAS[persona].limit) {
    return { accept: false, line: `${firstName(persona)} rejected it: "Yaar, itne paise nahi hain abhi."` };
  }
  return { accept: true, line: `${firstName(persona)} accepted it.` };
}

export const confirmation = (persona: Persona) => `${firstName(persona)} confirmed your payment. Settled.`;

type Who = 'me' | Persona;

// [from (owed), to (owes), title, amount, status, created, due, paid] with times in days from now.
const HISTORY: [Who, Who, string, number, Status, number, number, number | null][] = [
  ['me', 'hina', 'Birthday gift for Ayesha', 2000, 'Confirmed', -20, -13, -15],
  ['hina', 'me', 'Chai and samosa run', 450, 'Confirmed', -12, -5, -7],
  ['me', 'ali', 'Netflix, three months', 1350, 'Confirmed', -40, -33, -35],
  ['me', 'ali', 'Petrol for the Lahore trip', 2500, 'Confirmed', -30, -23, -18],
  ['me', 'ali', 'Biryani night', 900, 'Confirmed', -25, -18, -20],
  ['me', 'ali', 'Cricket kit share', 3000, 'Accepted', -2, 5, null],
  ['me', 'bilal', 'Concert tickets', 3000, 'Confirmed', -50, -43, -30],
  ['me', 'bilal', 'Dinner at Monal', 4800, 'Accepted', -14, -6, null],
  ['bilal', 'me', 'Uber to the airport', 1200, 'Accepted', -9, -2, null],
  ['sana', 'me', 'Wedding shopping split', 3500, 'Sent', -0.1, 7, null],
];

/** Creates the four friends, a tab with each, and the history above. */
export async function seedDemo(db: D1Database, meId: number, suffix: string, now: number): Promise<void> {
  const personas = Object.keys(PERSONAS) as Persona[];
  const bots = await db.batch<{ id: number }>(
    personas.map((p) =>
      db
        .prepare(
          `INSERT INTO users (email, name, bio, kind, persona, owner_id, created_at)
           VALUES (?, ?, ?, 'bot', ?, ?, ?) RETURNING id`,
        )
        .bind(`${p}-${suffix}@demo.wasuli.app`, PERSONAS[p].name, PERSONAS[p].bio, p, meId, now),
    ),
  );
  const ids: Record<Who, number> = { me: meId } as Record<Who, number>;
  personas.forEach((p, i) => (ids[p] = bots[i].results[0].id));

  const tabs = await db.batch<{ id: number }>(
    personas.map((p) =>
      db.prepare('INSERT INTO tabs (user_a, user_b, created_at) VALUES (?, ?, ?) RETURNING id').bind(meId, ids[p], now),
    ),
  );
  const tabOf = (p: Persona) => tabs[personas.indexOf(p)].results[0].id;

  await db.batch(
    HISTORY.map(([from, to, title, amount, status, created, due, paid]) => {
      const friend = (from === 'me' ? to : from) as Persona;
      const at = (days: number | null) => (days === null ? null : Math.round(now + days * DAY));
      const responded = status === 'Sent' ? null : at(created + 0.2);
      const settled = status === 'Confirmed' ? at(paid) : null;
      return db
        .prepare(
          `INSERT INTO receipts (tab_id, from_id, to_id, title, amount, status, due_at, created_at, responded_at, paid_at, settled_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(tabOf(friend), ids[from], ids[to], title, amount, status, at(due), at(created), responded, at(paid), settled);
    }),
  );
}
