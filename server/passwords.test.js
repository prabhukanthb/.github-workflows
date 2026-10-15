import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPassword, incomeToLacsInput, matchesLogin, phoneDigits, toIncomeRupees } from './passwords.js';

test('default password uses the first four letters and the last four mobile digits', () => {
  assert.equal(defaultPassword('Anitha', '9000000001'), 'Anit@0001');
  assert.equal(defaultPassword('Ravi Teja', '9440545049'), 'Ravi@5049');
  assert.equal(defaultPassword('Prabhu', '9876543210'), 'Prab@3210');
  assert.equal(defaultPassword('Raj', '9000011111'), 'Raj@1111');
  assert.equal(defaultPassword('S. Kiran', '8888888888'), 'SKir@8888');
  assert.equal(defaultPassword('Mary Kumari', '90000 00003'), 'Mary@0003');
  assert.equal(defaultPassword('', '9876543210'), 'User@3210');
});

test('login accepts the same email or mobile with spaces or a country code', () => {
  const user = { email: 'anitha.demo@example.com', phone: '9000000001', alternativePhone: '9000001111', status: 'active' };
  assert.equal(phoneDigits('+91 90000 00001'), '9000000001');
  assert.equal(phoneDigits('09000000001'), '9000000001');
  assert.equal(matchesLogin(user, 'Anitha.Demo@Example.com'), true);
  assert.equal(matchesLogin(user, '90000 00001'), true);
  assert.equal(matchesLogin(user, '+91 9000001111'), true);
  assert.equal(matchesLogin(user, '9000000002'), false);
});

test('income entered in lacs is stored in rupees', () => {
  assert.equal(toIncomeRupees(4.8), 480000);
  assert.equal(toIncomeRupees(480000), 480000);
  assert.equal(incomeToLacsInput(480000), '4.8');
  assert.equal(incomeToLacsInput(100000), '1');
});
