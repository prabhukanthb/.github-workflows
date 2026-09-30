import test from 'node:test';
import assert from 'node:assert/strict';
import { OFFICE_PHONE, buildSeed, withOfficePhone } from './seedData.js';

test('the office account phone is 9241512415', () => {
  const seed = buildSeed({ officeHash: 'x', memberHash: 'y' });
  const office = seed.users.find((user) => user.id === 'u-admin');
  assert.equal(office.phone, '9241512415');
  assert.equal(office.phone, OFFICE_PHONE);
});

test('an existing office login receives the new phone', () => {
  const next = withOfficePhone({
    users: [{ id: 'u-admin', email: 'admin@example.com', phone: '9440545049', role: 'admin' }]
  });
  assert.equal(next.users[0].phone, OFFICE_PHONE);
  assert.equal(withOfficePhone(next), next);
});
