// Walks the whole API like two real users and one test user would.
//   API_URL=http://localhost:8787 npm run smoke   (against `npm run dev`)

const BASE = process.env.API_URL ?? 'http://localhost:8787';
let checks = 0;

function check(cond: unknown, what: string): asserts cond {
  if (!cond) throw new Error(`FAIL: ${what}`);
  checks++;
  console.log(`  ok  ${what}`);
}

async function call<T = any>(method: string, path: string, token?: string, body?: object): Promise<{ status: number; data: T }> {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: (await res.json()) as T };
}

console.log('1. a test user gets a whole network in one click');
const demo = await call('POST', '/demo');
check(demo.status === 201 && demo.data.token && demo.data.user.testUser, `logged in as ${demo.data.user?.name}`);
const t = demo.data.token as string;
const dash = await call('GET', '/dashboard', t);
check(dash.data.totals.friends === 4, 'four friends');
check(dash.data.totals.owedToMe === 3000 + 4800 && dash.data.totals.iOwe === 1200, `owed Rs ${dash.data.totals.owedToMe}, owes Rs ${dash.data.totals.iOwe}`);
check(dash.data.me.score === 50 && dash.data.me.tier === 'Kar len ge bro', `score ${dash.data.me.score}: ${dash.data.me.tier}`);
check(dash.data.needsYou.length === 2, 'two things need you: Sana’s receipt and Bilal’s overdue one');

const ranks = (await call('GET', '/rankings', t)).data.rankings as any[];
const tierOf = (name: string) => ranks.find((r) => r.name.startsWith(name))?.tier;
check(tierOf('Hina') === 'Nawab Sahib' && tierOf('Ali') === 'Malik Riaz Jr' && tierOf('Bilal') === 'Karzai' && tierOf('Sana') === 'Naya Murga', 'rankings: Hina, Ali, Bilal and Sana each in their tier');

console.log('\n2. the receipt lifecycle, against demo friends who answer back');
const tabs = (await call('GET', '/tabs/getAllTabsByUsers', t)).data.tabs as any[];
const tabWith = (name: string) => tabs.find((x) => x.friend.name.startsWith(name));
let res = await call('POST', '/receipts/send', t, { tabId: tabWith('Ali').id, title: 'Chai at Kolachi', amount: 800 });
check(res.status === 201 && res.data.receipt.status === 'Accepted' && /accepted/.test(res.data.reaction), `Ali: ${res.data.reaction}`);
res = await call('POST', '/receipts/send', t, { tabId: tabWith('Bilal').id, title: 'New phone', amount: 90000 });
check(res.data.receipt.status === 'Rejected', `Bilal: ${res.data.reaction}`);

const sanas = (await call('GET', `/tabs/${tabWith('Sana').id}`, t)).data.receipts as any[];
const wedding = sanas.find((r) => r.title.startsWith('Wedding'));
check(wedding.actions.includes('accept') && wedding.actions.includes('reject'), 'Sana’s receipt waits for accept or reject');
res = await call('PUT', `/receipts/accept/${wedding.id}`, t);
check(res.data.receipt.status === 'Accepted', 'accepted');
res = await call('PUT', `/receipts/pay/${wedding.id}`, t);
check(res.data.receipt.status === 'Confirmed' && /confirmed/.test(res.data.reaction), `paid on time: ${res.data.reaction}`);

const uber = ((await call('GET', `/tabs/${tabWith('Bilal').id}`, t)).data.receipts as any[]).find((r) => r.title.startsWith('Uber'));
check(uber.overdue, 'the Uber receipt is overdue');
await call('PUT', `/receipts/pay/${uber.id}`, t);
const monal = ((await call('GET', `/tabs/${tabWith('Bilal').id}`, t)).data.receipts as any[]).find((r) => r.title.startsWith('Dinner'));
res = await call('PUT', `/receipts/pardon/${monal.id}`, t);
check(res.data.receipt.status === 'Pardoned', 'pardoned Bilal’s dinner');
const after = (await call('GET', '/dashboard', t)).data;
check(after.me.score === 83 && after.me.tier === 'Malik Riaz Jr', `score after paying: ${after.me.score}, ${after.me.tier}`);
check(after.totals.iOwe === 0, 'nothing owed any more');

console.log('\n3. two real people');
const stamp = Date.now();
const a = await call('POST', '/users', undefined, { name: 'Ayesha', email: `ayesha-${stamp}@example.com`, password: 'correct horse battery' });
const b = await call('POST', '/users', undefined, { name: 'Usman', email: `usman-${stamp}@example.com`, password: 'another good password' });
check(a.status === 201 && b.status === 201, 'two accounts');
check((await call('POST', '/users', undefined, { name: 'X', email: `ayesha-${stamp}@example.com`, password: 'whatever123' })).status === 409, 'emails are unique');
check((await call('POST', '/users/login', undefined, { email: `ayesha-${stamp}@example.com`, password: 'wrong password!' })).status === 401, 'wrong password is refused');
const login = await call('POST', '/users/login', undefined, { email: `ayesha-${stamp}@example.com`, password: 'correct horse battery' });
check(login.status === 200 && login.data.token, 'log in');
const [ta, tb] = [login.data.token as string, b.data.token as string];
const tab = await call('POST', '/tabs/createTab', ta, { email: `usman-${stamp}@example.com` });
check(tab.status === 201, 'Ayesha opens a tab with Usman by email');
const sent = await call('POST', '/receipts/send', ta, { tabId: tab.data.tab.id, title: 'Groceries', amount: 2400, dueInDays: 3 });
check(sent.data.receipt.status === 'Sent', 'sent, waiting for Usman');
check((await call('PUT', `/receipts/accept/${sent.data.receipt.id}`, ta)).status === 403, 'Ayesha can’t accept her own receipt');
check((await call('PUT', `/receipts/accept/${sent.data.receipt.id}`, tb)).data.receipt.status === 'Accepted', 'Usman accepts');
check((await call('PUT', `/receipts/confirm/${sent.data.receipt.id}`, ta)).status === 409, 'can’t confirm before it’s paid');
check((await call('PUT', `/receipts/pay/${sent.data.receipt.id}`, tb)).data.receipt.status === 'Paid', 'Usman marks it paid');
check((await call('PUT', `/receipts/confirm/${sent.data.receipt.id}`, ta)).data.receipt.status === 'Confirmed', 'Ayesha confirms');
check((await call('GET', `/tabs/${tab.data.tab.id}`, t)).status === 404, 'the test user can’t read their tab');
check((await call('GET', '/dashboard')).status === 401, 'no token, no data');

console.log(`\nall ${checks} checks passed`);
