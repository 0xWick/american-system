// American System API on Cloudflare Workers + D1. Serves the Wasuli Bhai app's /api routes;
// every other path is the static app. Routes keep the original Express API's shape.

import { hashPassword, sha256, signToken, verifyPassword, verifyToken } from './auth';
import { confirmation, reaction, seedDemo, type Persona } from './demo';
import { creditScore, NEWCOMER, tierFor, TIERS, type Debt, type Status } from './score';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  JWT_SECRET: string;
  DEMOS_PER_HOUR: string;
}

interface UserRow {
  id: number;
  email: string;
  name: string;
  bio: string;
  kind: 'user' | 'demo' | 'bot';
  persona: Persona | null;
  password_hash: string | null;
  created_at: number;
}

interface ReceiptRow {
  id: number;
  tab_id: number;
  from_id: number;
  to_id: number;
  title: string;
  description: string;
  amount: number;
  status: Status;
  due_at: number;
  created_at: number;
  responded_at: number | null;
  paid_at: number | null;
  settled_at: number | null;
}

type Action = 'accept' | 'reject' | 'cancel' | 'pay' | 'confirm' | 'pardon';

/** Who may move a receipt, from which states, to which state. `from` is the one owed. */
const RULES: Record<Action, { by: 'from' | 'to'; from: Status[]; to: Status; stamp: 'responded_at' | 'paid_at' | 'settled_at' }> = {
  accept: { by: 'to', from: ['Sent'], to: 'Accepted', stamp: 'responded_at' },
  reject: { by: 'to', from: ['Sent'], to: 'Rejected', stamp: 'responded_at' },
  cancel: { by: 'from', from: ['Sent'], to: 'Cancelled', stamp: 'settled_at' },
  pay: { by: 'to', from: ['Accepted'], to: 'Paid', stamp: 'paid_at' },
  confirm: { by: 'from', from: ['Paid'], to: 'Confirmed', stamp: 'settled_at' },
  pardon: { by: 'from', from: ['Accepted'], to: 'Pardoned', stamp: 'settled_at' },
};

/** Still owed: agreed to, and not yet confirmed as paid. */
const OPEN: Status[] = ['Accepted', 'Paid'];
const DAY = 86_400_000;

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const fail = (status: number, message: string): never => {
  throw new HttpError(status, message);
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

interface Ctx {
  req: Request;
  env: Env;
  params: string[];
  body: Record<string, unknown>;
}
type Route = [method: string, path: RegExp, handler: (c: Ctx, me: UserRow) => Promise<Response>];
type OpenRoute = [method: string, path: RegExp, handler: (c: Ctx) => Promise<Response>];

// ─── Validation ──────────────────────────────────────────────────────────────

function text(value: unknown, field: string, max: number, required = true): string {
  const s = typeof value === 'string' ? value.trim() : '';
  if (required && !s) fail(400, `${field} is required.`);
  if (s.length > max) fail(400, `${field} must be at most ${max} characters.`);
  return s;
}

function email(value: unknown): string {
  const s = text(value, 'Email', 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) fail(400, 'That email doesn’t look right.');
  return s;
}

function int(value: unknown, field: string, min: number, max: number): number {
  const n = typeof value === 'string' ? Number(value.replace(/,/g, '')) : Number(value);
  if (!Number.isInteger(n) || n < min || n > max) fail(400, `${field} must be a whole number from ${min.toLocaleString()} to ${max.toLocaleString()}.`);
  return n;
}

// ─── Views ───────────────────────────────────────────────────────────────────

async function scoresFor(db: D1Database, ids: number[], now: number): Promise<Map<number, number | null>> {
  const out = new Map<number, number | null>(ids.map((id) => [id, null]));
  if (!ids.length) return out;
  const { results } = await db
    .prepare(
      `SELECT to_id, status, due_at, paid_at FROM receipts
       WHERE status IN ('Accepted', 'Paid', 'Confirmed') AND to_id IN (${ids.map(() => '?').join(',')})`,
    )
    .bind(...ids)
    .all<Debt & { to_id: number }>();
  const byUser = new Map<number, Debt[]>();
  for (const r of results) byUser.set(r.to_id, [...(byUser.get(r.to_id) ?? []), r]);
  for (const id of ids) out.set(id, creditScore(byUser.get(id) ?? [], now));
  return out;
}

function person(u: Pick<UserRow, 'id' | 'name' | 'bio' | 'kind'>, score: number | null) {
  const tier = tierFor(score);
  return { id: u.id, name: u.name, bio: u.bio, demo: u.kind === 'bot', score, tier: tier.name, tierBlurb: tier.blurb };
}

function actionsFor(r: ReceiptRow, me: number): Action[] {
  const iAmOwed = r.from_id === me;
  return (Object.keys(RULES) as Action[]).filter((a) => RULES[a].from.includes(r.status) && (RULES[a].by === 'from') === iAmOwed);
}

function receiptView(r: ReceiptRow, me: number, names: Map<number, string>, now: number) {
  const iAmOwed = r.from_id === me;
  const friendId = iAmOwed ? r.to_id : r.from_id;
  return {
    id: r.id,
    tabId: r.tab_id,
    title: r.title,
    description: r.description,
    amount: r.amount,
    status: r.status,
    overdue: r.status === 'Accepted' && r.due_at < now,
    direction: iAmOwed ? 'owed_to_me' : 'i_owe',
    friend: { id: friendId, name: names.get(friendId) ?? 'Someone' },
    dueAt: r.due_at,
    createdAt: r.created_at,
    respondedAt: r.responded_at,
    paidAt: r.paid_at,
    settledAt: r.settled_at,
    updatedAt: Math.max(r.created_at, r.responded_at ?? 0, r.paid_at ?? 0, r.settled_at ?? 0),
    actions: actionsFor(r, me),
  };
}

function balances(receipts: ReceiptRow[], me: number) {
  let owedToMe = 0;
  let iOwe = 0;
  for (const r of receipts) {
    if (!OPEN.includes(r.status)) continue;
    if (r.from_id === me) owedToMe += r.amount;
    else iOwe += r.amount;
  }
  return { owedToMe, iOwe, net: owedToMe - iOwe };
}

// ─── Data access ─────────────────────────────────────────────────────────────

const userById = (db: D1Database, id: number) => db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRow>();

async function myReceipts(db: D1Database, me: number) {
  const { results } = await db
    .prepare('SELECT * FROM receipts WHERE from_id = ?1 OR to_id = ?1 ORDER BY created_at DESC')
    .bind(me)
    .all<ReceiptRow>();
  return results;
}

async function myFriends(db: D1Database, me: number) {
  const { results } = await db
    .prepare(
      `SELECT t.id AS tab_id, u.id, u.name, u.bio, u.kind, t.created_at
       FROM tabs t JOIN users u ON u.id = CASE WHEN t.user_a = ?1 THEN t.user_b ELSE t.user_a END
       WHERE t.user_a = ?1 OR t.user_b = ?1`,
    )
    .bind(me)
    .all<Pick<UserRow, 'id' | 'name' | 'bio' | 'kind' | 'created_at'> & { tab_id: number }>();
  return results;
}

async function session(env: Env, user: UserRow, ttlSeconds?: number) {
  const now = Date.now();
  const score = (await scoresFor(env.DB, [user.id], now)).get(user.id) ?? null;
  return { token: await signToken(user.id, env.JWT_SECRET, ttlSeconds), user: { ...person(user, score), email: user.email, testUser: user.kind === 'demo' } };
}

// ─── Open routes ─────────────────────────────────────────────────────────────

async function register({ env, body }: Ctx) {
  const name = text(body.name, 'Name', 40);
  const address = email(body.email);
  const password = text(body.password, 'Password', 200);
  if (password.length < 8) fail(400, 'Use at least 8 characters for your password.');
  if (await env.DB.prepare('SELECT 1 FROM users WHERE email = ?').bind(address).first()) fail(409, 'That email already has an account. Log in instead.');
  const user = await env.DB.prepare(
    `INSERT INTO users (email, name, bio, password_hash, kind, created_at) VALUES (?, ?, ?, ?, 'user', ?) RETURNING *`,
  )
    .bind(address, name, text(body.bio, 'Bio', 120, false), await hashPassword(password), Date.now())
    .first<UserRow>();
  return json(await session(env, user!), 201);
}

async function login({ env, body }: Ctx) {
  const user = await env.DB.prepare(`SELECT * FROM users WHERE email = ? AND kind = 'user'`).bind(email(body.email)).first<UserRow>();
  if (!user?.password_hash || !(await verifyPassword(text(body.password, 'Password', 200), user.password_hash))) {
    fail(401, 'Wrong email or password.');
  }
  return json(await session(env, user!));
}

/** "Try it as a test user": a fresh account with four friends and a history, logged in at once. */
async function demo({ req, env }: Ctx) {
  const now = Date.now();
  const ipHash = await sha256(`wasuli:${req.headers.get('cf-connecting-ip') ?? 'local'}`);
  const recent = await env.DB.prepare(`SELECT COUNT(*) AS n FROM users WHERE kind = 'demo' AND ip_hash = ? AND created_at > ?`)
    .bind(ipHash, now - 3_600_000)
    .first<{ n: number }>();
  if ((recent?.n ?? 0) >= Number(env.DEMOS_PER_HOUR || 10)) fail(429, 'That’s a lot of test users for one hour. Try again a bit later.');
  const suffix = crypto.randomUUID().slice(0, 8);
  const user = await env.DB.prepare(
    `INSERT INTO users (email, name, bio, kind, ip_hash, created_at) VALUES (?, ?, ?, 'demo', ?, ?) RETURNING *`,
  )
    .bind(`guest-${suffix}@demo.wasuli.app`, `Guest ${suffix.slice(0, 4).toUpperCase()}`, 'Trying out Wasuli Bhai.', ipHash, now)
    .first<UserRow>();
  await seedDemo(env.DB, user!.id, suffix, now);
  return json(await session(env, user!, 60 * 60 * 24), 201);
}

async function tiers() {
  return json({ tiers: [...TIERS, NEWCOMER].map(({ name, min, blurb }) => ({ name, min: Math.max(min, 0), blurb, newcomer: min < 0 })) });
}

// ─── Signed-in routes ────────────────────────────────────────────────────────

async function profile({ env }: Ctx, me: UserRow) {
  const now = Date.now();
  const [receipts, friends, scores] = await Promise.all([myReceipts(env.DB, me.id), myFriends(env.DB, me.id), scoresFor(env.DB, [me.id], now)]);
  const asDebtor = receipts.filter((r) => r.to_id === me.id && (r.status === 'Paid' || r.status === 'Confirmed'));
  return json({
    user: { ...person(me, scores.get(me.id) ?? null), email: me.email, testUser: me.kind === 'demo', joinedAt: me.created_at },
    stats: {
      friends: friends.length,
      sent: receipts.filter((r) => r.from_id === me.id).length,
      received: receipts.filter((r) => r.to_id === me.id).length,
      paidOnTime: asDebtor.filter((r) => r.paid_at !== null && r.paid_at <= r.due_at).length,
      paidLate: asDebtor.filter((r) => r.paid_at !== null && r.paid_at > r.due_at).length,
      ...balances(receipts, me.id),
    },
  });
}

async function exists({ env, body }: Ctx, me: UserRow) {
  const found = await env.DB.prepare(`SELECT * FROM users WHERE email = ? AND kind = 'user' AND id != ?`).bind(email(body.email), me.id).first<UserRow>();
  if (!found) fail(404, 'No one with that email is on Wasuli Bhai yet.');
  const score = (await scoresFor(env.DB, [found!.id], Date.now())).get(found!.id) ?? null;
  return json({ user: person(found!, score) });
}

async function dashboard({ env }: Ctx, me: UserRow) {
  const now = Date.now();
  const [receipts, friends] = await Promise.all([myReceipts(env.DB, me.id), myFriends(env.DB, me.id)]);
  const scores = await scoresFor(env.DB, [me.id], now);
  const names = new Map(friends.map((f) => [f.id, f.name]));
  const views = receipts.map((r) => receiptView(r, me.id, names, now));
  return json({
    me: { ...person(me, scores.get(me.id) ?? null), testUser: me.kind === 'demo' },
    totals: { ...balances(receipts, me.id), friends: friends.length, overdueOwedToMe: views.filter((v) => v.overdue && v.direction === 'owed_to_me').length, overdueIOwe: views.filter((v) => v.overdue && v.direction === 'i_owe').length },
    needsYou: views.filter((v) => v.actions.some((a) => a === 'accept' || a === 'pay' || a === 'confirm')),
    recent: [...views].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8),
  });
}

async function listTabs({ env }: Ctx, me: UserRow) {
  const now = Date.now();
  const [friends, receipts] = await Promise.all([myFriends(env.DB, me.id), myReceipts(env.DB, me.id)]);
  const scores = await scoresFor(env.DB, friends.map((f) => f.id), now);
  const tabs = friends.map((f) => {
    const onTab = receipts.filter((r) => r.tab_id === f.tab_id);
    return {
      id: f.tab_id,
      friend: person(f, scores.get(f.id) ?? null),
      ...balances(onTab, me.id),
      waiting: onTab.filter((r) => actionsFor(r, me.id).some((a) => a === 'accept' || a === 'pay' || a === 'confirm')).length,
      overdue: onTab.filter((r) => r.status === 'Accepted' && r.due_at < now).length,
      receipts: onTab.length,
      lastActivity: Math.max(f.created_at, ...onTab.map((r) => Math.max(r.created_at, r.responded_at ?? 0, r.paid_at ?? 0, r.settled_at ?? 0))),
    };
  });
  return json({ tabs: tabs.sort((a, b) => b.lastActivity - a.lastActivity) });
}

async function createTab({ env, body }: Ctx, me: UserRow) {
  const friend = await env.DB.prepare(`SELECT * FROM users WHERE email = ? AND kind = 'user'`).bind(email(body.email)).first<UserRow>();
  if (!friend) fail(404, 'No one with that email is on Wasuli Bhai yet.');
  if (friend!.id === me.id) fail(400, 'You can’t open a tab with yourself.');
  const [a, b] = [me.id, friend!.id].sort((x, y) => x - y);
  await env.DB.prepare('INSERT OR IGNORE INTO tabs (user_a, user_b, created_at) VALUES (?, ?, ?)').bind(a, b, Date.now()).run();
  const tab = await env.DB.prepare('SELECT id FROM tabs WHERE user_a = ? AND user_b = ?').bind(a, b).first<{ id: number }>();
  return json({ tab: { id: tab!.id, friend: person(friend!, (await scoresFor(env.DB, [friend!.id], Date.now())).get(friend!.id) ?? null) } }, 201);
}

async function tabFor(db: D1Database, tabId: number, me: number) {
  const tab = await db.prepare('SELECT * FROM tabs WHERE id = ?1 AND (user_a = ?2 OR user_b = ?2)').bind(tabId, me).first<{ id: number; user_a: number; user_b: number }>();
  if (!tab) fail(404, 'That tab doesn’t exist, or isn’t yours.');
  return { ...tab!, friendId: tab!.user_a === me ? tab!.user_b : tab!.user_a };
}

async function getTab({ env, params }: Ctx, me: UserRow) {
  const now = Date.now();
  const tab = await tabFor(env.DB, Number(params[0]), me.id);
  const friend = (await userById(env.DB, tab.friendId))!;
  const { results } = await env.DB.prepare('SELECT * FROM receipts WHERE tab_id = ? ORDER BY created_at DESC').bind(tab.id).all<ReceiptRow>();
  const scores = await scoresFor(env.DB, [friend.id], now);
  const names = new Map([[friend.id, friend.name]]);
  return json({ tab: { id: tab.id, friend: person(friend, scores.get(friend.id) ?? null), ...balances(results, me.id) }, receipts: results.map((r) => receiptView(r, me.id, names, now)) });
}

async function listReceipts({ env }: Ctx, me: UserRow) {
  const now = Date.now();
  const [receipts, friends] = await Promise.all([myReceipts(env.DB, me.id), myFriends(env.DB, me.id)]);
  const names = new Map(friends.map((f) => [f.id, f.name]));
  return json({ receipts: receipts.map((r) => receiptView(r, me.id, names, now)) });
}

async function getReceipt({ env, params }: Ctx, me: UserRow) {
  const r = await env.DB.prepare('SELECT * FROM receipts WHERE id = ?1 AND (from_id = ?2 OR to_id = ?2)').bind(Number(params[0]), me.id).first<ReceiptRow>();
  if (!r) fail(404, 'That receipt doesn’t exist, or isn’t yours.');
  const friend = (await userById(env.DB, r!.from_id === me.id ? r!.to_id : r!.from_id))!;
  return json({ receipt: receiptView(r!, me.id, new Map([[friend.id, friend.name]]), Date.now()) });
}

async function update(db: D1Database, id: number, action: Action, now: number) {
  const rule = RULES[action];
  return db.prepare(`UPDATE receipts SET status = ?, ${rule.stamp} = ? WHERE id = ? RETURNING *`).bind(rule.to, now, id).first<ReceiptRow>();
}

async function sendReceipt({ env, body }: Ctx, me: UserRow) {
  const now = Date.now();
  const tab = await tabFor(env.DB, int(body.tabId, 'Tab', 1, Number.MAX_SAFE_INTEGER), me.id);
  const title = text(body.title, 'Title', 60);
  const amount = int(body.amount, 'Amount', 1, 10_000_000);
  const dueInDays = body.dueInDays === undefined ? 7 : int(body.dueInDays, 'Due in days', 1, 90);
  let receipt = (await env.DB.prepare(
    `INSERT INTO receipts (tab_id, from_id, to_id, title, description, amount, status, due_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'Sent', ?, ?) RETURNING *`,
  )
    .bind(tab.id, me.id, tab.friendId, title, text(body.description, 'Note', 200, false), amount, now + dueInDays * DAY, now)
    .first<ReceiptRow>())!;

  // Demo friends answer straight away.
  const friend = (await userById(env.DB, tab.friendId))!;
  let said: string | undefined;
  if (friend.kind === 'bot' && friend.persona) {
    const answer = reaction(friend.persona, amount);
    receipt = (await update(env.DB, receipt.id, answer.accept ? 'accept' : 'reject', now + 1))!;
    said = answer.line;
  }
  return json({ receipt: receiptView(receipt, me.id, new Map([[friend.id, friend.name]]), now), reaction: said }, 201);
}

async function act({ env, params }: Ctx, me: UserRow) {
  const now = Date.now();
  const action = params[0] as Action;
  const rule = RULES[action];
  const r = await env.DB.prepare('SELECT * FROM receipts WHERE id = ?1 AND (from_id = ?2 OR to_id = ?2)').bind(Number(params[1]), me.id).first<ReceiptRow>();
  if (!r) fail(404, 'That receipt doesn’t exist, or isn’t yours.');
  if ((rule.by === 'from') !== (r!.from_id === me.id)) fail(403, `Only the ${rule.by === 'from' ? 'person who sent it' : 'person who owes it'} can ${action} this receipt.`);
  if (!rule.from.includes(r!.status)) fail(409, `This receipt is ${r!.status.toLowerCase()}, so it can’t be ${action === 'pay' ? 'paid' : `${action}ed`} now.`);

  let receipt = (await update(env.DB, r!.id, action, now))!;
  const friend = (await userById(env.DB, r!.from_id === me.id ? r!.to_id : r!.from_id))!;
  let said: string | undefined;
  if (action === 'pay' && friend.kind === 'bot' && friend.persona) {
    receipt = (await update(env.DB, receipt.id, 'confirm', now + 1))!;
    said = confirmation(friend.persona);
  }
  return json({ receipt: receiptView(receipt, me.id, new Map([[friend.id, friend.name]]), now), reaction: said });
}

async function rankings({ env }: Ctx, me: UserRow) {
  const now = Date.now();
  const friends = await myFriends(env.DB, me.id);
  const people = [{ ...me }, ...friends];
  const scores = await scoresFor(env.DB, people.map((p) => p.id), now);
  const ranked = people
    .map((p) => ({ ...person(p, scores.get(p.id) ?? null), you: p.id === me.id }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.name.localeCompare(b.name));
  return json({ rankings: ranked });
}

// ─── Router ──────────────────────────────────────────────────────────────────

const OPEN_ROUTES: OpenRoute[] = [
  ['POST', /^\/api\/users$/, register],
  ['POST', /^\/api\/users\/login$/, login],
  ['POST', /^\/api\/demo$/, demo],
  ['GET', /^\/api\/tiers$/, tiers],
];

const ROUTES: Route[] = [
  ['GET', /^\/api\/users\/profile$/, profile],
  ['POST', /^\/api\/users\/exists$/, exists],
  ['GET', /^\/api\/dashboard$/, dashboard],
  ['GET', /^\/api\/tabs\/getAllTabsByUsers$/, listTabs],
  ['POST', /^\/api\/tabs\/createTab$/, createTab],
  ['GET', /^\/api\/tabs\/(\d+)$/, getTab],
  ['GET', /^\/api\/receipts\/getReceipts$/, listReceipts],
  ['POST', /^\/api\/receipts\/send$/, sendReceipt],
  ['PUT', /^\/api\/receipts\/(accept|reject|cancel|pay|confirm|pardon)\/(\d+)$/, act],
  ['GET', /^\/api\/receipts\/(\d+)$/, getReceipt],
  ['GET', /^\/api\/rankings$/, rankings],
];

async function route(req: Request, env: Env, url: URL): Promise<Response> {
  const body = req.method === 'POST' ? ((await req.json().catch(() => ({}))) as Record<string, unknown>) : {};
  for (const [method, path, handler] of OPEN_ROUTES) {
    const m = url.pathname.match(path);
    if (m && req.method === method) return handler({ req, env, params: m.slice(1), body });
  }
  for (const [method, path, handler] of ROUTES) {
    const m = url.pathname.match(path);
    if (!m || req.method !== method) continue;
    const token = req.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
    const id = token ? await verifyToken(token, env.JWT_SECRET) : null;
    const me = id === null ? null : await userById(env.DB, id);
    if (!me) fail(401, 'Please log in again.');
    return handler({ req, env, params: m.slice(1), body }, me!);
  }
  return json({ error: 'Not found.' }, 404);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    try {
      return await route(req, env, url);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error(err);
      return json({ error: 'Something went wrong. Try again.' }, 500);
    }
  },

  /** Test users and their friends last a day. */
  async scheduled(_event, env) {
    await env.DB.prepare(`DELETE FROM users WHERE kind = 'demo' AND created_at < ?`).bind(Date.now() - DAY).run();
  },
} satisfies ExportedHandler<Env>;

