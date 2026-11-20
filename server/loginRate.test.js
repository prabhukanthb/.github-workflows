import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { LOGIN_FAILURE } from './rateLimit.js';

process.env.VERCEL = '1';
const { default: app } = await import('./index.js');

function listen() {
  const server = app.listen(0, '127.0.0.1');
  return once(server, 'listening').then(() => server);
}

async function post(port, body, ip) {
  const response = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': ip
    },
    body: JSON.stringify(body)
  });
  return { status: response.status, data: await response.json() };
}

test('an unknown account and a wrong password return the same error', async () => {
  const server = await listen();
  const port = server.address().port;
  try {
    const unknown = await post(port, { emailOrPhone: 'nobody-rate-limit@example.com', password: 'wrong-password' }, '203.0.113.10');
    const wrong = await post(port, { emailOrPhone: 'admin@example.com', password: 'wrong-password' }, '203.0.113.11');
    assert.equal(unknown.status, 401);
    assert.equal(wrong.status, 401);
    assert.equal(unknown.data.message, LOGIN_FAILURE);
    assert.equal(wrong.data.message, LOGIN_FAILURE);
  } finally {
    server.close();
  }
});

test('the same account cannot try a fourth login from a new IP within 15 minutes', async () => {
  const server = await listen();
  const port = server.address().port;
  const body = { emailOrPhone: 'missing-rate@example.com', password: 'wrong-password' };
  try {
    for (let i = 1; i <= 3; i += 1) {
      const result = await post(port, body, `198.51.100.${i}`);
      assert.equal(result.status, 401);
    }
    const blocked = await post(port, body, '198.51.100.20');
    assert.equal(blocked.status, 429);
    assert.equal(blocked.data.message, 'Too many attempts. Try again in 15 minutes.');
  } finally {
    server.close();
  }
});
