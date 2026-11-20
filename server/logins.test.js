import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clientIp,
  istDayKey,
  loginReport,
  placeForIp,
  pruneLogins,
  recordLogin
} from './logins.js';

const noonIst = new Date('2026-11-20T06:30:00.000Z');

test('a login just before midnight in India belongs to that India day', () => {
  assert.equal(istDayKey('2026-11-19T18:29:00.000Z'), '2026-11-19');
  assert.equal(istDayKey('2026-11-19T18:30:00.000Z'), '2026-11-20');
});

test('logins older than 30 India days are removed and the same person counts once', () => {
  const old = new Date(noonIst.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const kept = new Date(noonIst.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString();
  const state = recordLogin({
    logins: [
      { id: 'old', userId: 'u1', at: old, ip: '1.1.1.1', place: 'Old' }
    ]
  }, { id: 'a', userId: 'u1', at: kept, ip: '1.1.1.1', place: 'Hyderabad, Telangana, India' }, noonIst);
  const again = recordLogin(state, { id: 'b', userId: 'u1', at: noonIst.toISOString(), ip: '8.8.8.8', place: 'Vijayawada, Andhra Pradesh, India' }, noonIst);
  const other = recordLogin(again, { id: 'c', userId: 'u2', at: noonIst.toISOString(), ip: '9.9.9.9', place: 'This network' }, noonIst);
  assert.equal(pruneLogins(other.logins, noonIst).some((item) => item.id === 'old'), false);
  const report = loginReport(other, '2026-11-20', [
    { id: 'u1', firstName: 'Anitha', surname: 'Rao', role: 'user' },
    { id: 'u2', firstName: 'Office', surname: 'Admin', role: 'admin' }
  ], noonIst);
  assert.equal(report.count, 2);
  assert.equal(report.logins.length, 2);
  assert.deepEqual(report.logins.map((item) => item.name).sort(), ['Anitha Rao', 'Office Admin']);
  assert.equal(report.logins.find((item) => item.name === 'Office Admin').role, 'Office');
  assert.equal(report.days.length, 30);
  assert.equal(report.days[0].count, 2);
  assert.equal(report.days.find((item) => item.day === '2026-10-22').count, 1);
});

test('a local address is not sent for a city lookup', async () => {
  let called = false;
  const place = await placeForIp('127.0.0.1', async () => {
    called = true;
    return { ok: true, json: async () => ({}) };
  });
  assert.equal(place, 'This network');
  assert.equal(called, false);
  assert.equal(clientIp({ ip: '::ffff:203.0.113.8' }), '203.0.113.8');
  const city = await placeForIp('203.0.113.8', async () => ({
    ok: true,
    json: async () => ({ success: true, city: 'Vijayawada', region: 'Andhra Pradesh', country: 'India' })
  }));
  assert.equal(city, 'Vijayawada, Andhra Pradesh, India');
  const missing = await placeForIp('203.0.113.9', async () => {
    throw new Error('offline');
  });
  assert.equal(missing, 'Not available');
});
