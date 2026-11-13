import test from 'node:test';
import assert from 'node:assert/strict';
import { createLimiter, normalizeAccount } from './rateLimit.js';

test('an account is the same after email case and phone formatting changes', () => {
  assert.equal(normalizeAccount('  Office@Example.com '), 'office@example.com');
  assert.equal(normalizeAccount('+91 92415 12415'), normalizeAccount('9241512415'));
  assert.equal(normalizeAccount(''), '');
});

test('the fourth attempt in 15 minutes is refused for that IP and that account', () => {
  const limiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 3 });
  const now = 1_000_000;
  const keys = ['ip:login:203.0.113.8', 'acct:login:office@example.com'];
  assert.equal(limiter.attempt(keys, now).limited, false);
  assert.equal(limiter.attempt(keys, now + 1).limited, false);
  assert.equal(limiter.attempt(keys, now + 2).limited, false);
  const blocked = limiter.attempt(keys, now + 3);
  assert.equal(blocked.limited, true);
  assert.ok(blocked.retryAfterMs > 0);
});

test('a new IP does not bypass the account limit', () => {
  const limiter = createLimiter({ windowMs: 1000, max: 3 });
  const now = 5_000;
  for (let i = 0; i < 3; i += 1) {
    assert.equal(limiter.attempt(['ip:login:1.1.1.1', 'acct:login:member@example.com'], now + i).limited, false);
  }
  const blocked = limiter.attempt(['ip:login:2.2.2.2', 'acct:login:member@example.com'], now + 4);
  assert.equal(blocked.limited, true);
});

test('a new account does not bypass the IP limit', () => {
  const limiter = createLimiter({ windowMs: 1000, max: 3 });
  const now = 8_000;
  for (let i = 0; i < 3; i += 1) {
    assert.equal(limiter.attempt([`ip:login:9.9.9.9`, `acct:login:user${i}@example.com`], now + i).limited, false);
  }
  const blocked = limiter.attempt(['ip:login:9.9.9.9', 'acct:login:other@example.com'], now + 4);
  assert.equal(blocked.limited, true);
});

test('attempts are allowed again after the window passes', () => {
  const limiter = createLimiter({ windowMs: 1000, max: 3 });
  const now = 20_000;
  for (let i = 0; i < 3; i += 1) limiter.attempt(['ip:login:8.8.8.8'], now);
  assert.equal(limiter.attempt(['ip:login:8.8.8.8'], now + 500).limited, true);
  assert.equal(limiter.attempt(['ip:login:8.8.8.8'], now + 1000).limited, false);
});
