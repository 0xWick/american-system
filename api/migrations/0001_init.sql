-- American System: people, the tab between every pair of them, and the receipts on each tab.

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  password_hash TEXT,                        -- null for demo friends
  kind TEXT NOT NULL DEFAULT 'user',         -- user | demo | bot
  persona TEXT,                              -- which demo friend a bot plays
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,  -- the test user a demo friend belongs to
  ip_hash TEXT,                              -- test users only, for rate limiting
  created_at INTEGER NOT NULL
);

CREATE TABLE tabs (
  id INTEGER PRIMARY KEY,
  user_a INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  UNIQUE (user_a, user_b),
  CHECK (user_a < user_b)
);

-- from_id is owed the money, to_id owes it.
CREATE TABLE receipts (
  id INTEGER PRIMARY KEY,
  tab_id INTEGER NOT NULL REFERENCES tabs(id) ON DELETE CASCADE,
  from_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL CHECK (status IN ('Sent', 'Cancelled', 'Rejected', 'Accepted', 'Paid', 'Confirmed', 'Pardoned')),
  due_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  responded_at INTEGER,
  paid_at INTEGER,
  settled_at INTEGER
);

CREATE INDEX receipts_by_tab ON receipts (tab_id);
CREATE INDEX receipts_by_from ON receipts (from_id, status);
CREATE INDEX receipts_by_to ON receipts (to_id, status);
CREATE INDEX users_by_kind ON users (kind, created_at);
