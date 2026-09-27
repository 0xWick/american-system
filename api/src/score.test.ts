import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creditScore, tierFor, type Debt } from './score';

const DAY = 86_400_000;
const now = 100 * DAY;
const debt = (status: Debt['status'], dueIn: number, paidIn: number | null = null): Debt => ({
  status,
  due_at: now + dueIn * DAY,
  paid_at: paidIn === null ? null : now + paidIn * DAY,
});

test('no judged debts means no score, and the newcomer tier', () => {
  assert.equal(creditScore([], now), null);
  assert.equal(creditScore([debt('Accepted', 3), debt('Sent', 3), debt('Pardoned', -9), debt('Rejected', -9)], now), null);
  assert.equal(tierFor(null).name, 'Naya Murga');
});

test('on time counts fully, late counts half, overdue counts zero', () => {
  assert.equal(creditScore([debt('Confirmed', -5, -6)], now), 100);
  assert.equal(creditScore([debt('Confirmed', -5, -2)], now), 50);
  assert.equal(creditScore([debt('Accepted', -1)], now), 0);
  assert.equal(creditScore([debt('Paid', 2, -1), debt('Confirmed', -5, -2), debt('Accepted', -1)], now), 50);
});

test('tiers follow the score', () => {
  assert.equal(tierFor(100).name, 'Nawab Sahib');
  assert.equal(tierFor(88).name, 'Malik Riaz Jr');
  assert.equal(tierFor(50).name, 'Kar len ge bro');
  assert.equal(tierFor(30).name, 'Mufta');
  assert.equal(tierFor(0).name, 'Karzai');
});
