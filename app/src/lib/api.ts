// The American System API, from the browser. Same origin: the Worker serves /api/*.

export interface Person {
  id: number;
  name: string;
  bio: string;
  demo: boolean;
  score: number | null;
  tier: string;
  tierBlurb: string;
}

export interface Me extends Person {
  email?: string;
  testUser: boolean;
}

export type Status = 'Sent' | 'Cancelled' | 'Rejected' | 'Accepted' | 'Paid' | 'Confirmed' | 'Pardoned';
export type Action = 'accept' | 'reject' | 'cancel' | 'pay' | 'confirm' | 'pardon';

export interface Receipt {
  id: number;
  tabId: number;
  title: string;
  description: string;
  amount: number;
  status: Status;
  overdue: boolean;
  direction: 'owed_to_me' | 'i_owe';
  friend: { id: number; name: string };
  dueAt: number;
  createdAt: number;
  respondedAt: number | null;
  paidAt: number | null;
  settledAt: number | null;
  updatedAt: number;
  actions: Action[];
}

export interface Balance {
  owedToMe: number;
  iOwe: number;
  net: number;
}

export interface TabSummary extends Balance {
  id: number;
  friend: Person;
  waiting: number;
  overdue: number;
  receipts: number;
  lastActivity: number;
}

export interface Session {
  token: string;
  user: Me;
}

const KEY = 'wasuli.session';
let memory: Session | null = null; // if storage is blocked, the session still lasts the visit

export function getSession(): Session | null {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    memory = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    memory = null;
  }
  return memory;
}

export function saveSession(session: Session) {
  memory = session;
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* private mode: the in-memory copy is enough */
  }
}

export function clearSession() {
  memory = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(method: 'GET' | 'POST' | 'PUT', path: string, body?: object): Promise<T> {
  const token = getSession()?.token;
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    if (res.status === 401 && token) {
      clearSession();
      window.location.assign('/?expired=1');
    }
    throw new ApiError(res.status, data.error ?? 'Something went wrong. Try again.');
  }
  return data as T;
}

/** "Try it as a test user": a fresh account with four friends, logged in at once. */
export async function startTestUser(): Promise<Session> {
  const session = await api<Session>('POST', '/demo');
  saveSession(session);
  return session;
}
