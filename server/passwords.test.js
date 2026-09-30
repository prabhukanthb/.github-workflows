import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPassword, incomeToLacsInput, toIncomeRupees } from './passwords.js';

test('default password uses the first four letters and the last four mobile digits', () => {
  assert.equal(defaultPassword('Anitha', '9000000001'), 'Anit@0001');
  assert.equal(defaultPassword('Ravi Teja', '9440545049'), 'Ravi@5049');
});

test('income entered in lacs is stored in rupees', () => {
  assert.equal(toIncomeRupees(4.8), 480000);
  assert.equal(toIncomeRupees(480000), 480000);
  assert.equal(incomeToLacsInput(480000), '4.8');
  assert.equal(incomeToLacsInput(100000), '1');
});
