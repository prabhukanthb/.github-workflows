import test from 'node:test';
import assert from 'node:assert/strict';
import { missingProfileFields } from './profileRequired.js';

test('a profile is not complete until name, phone, introduction and date of birth are filled', () => {
  assert.deepEqual(missingProfileFields({}), [
    'Full Name',
    'Surname',
    'Phone',
    'Looking to introduce',
    'Date of birth'
  ]);
  assert.deepEqual(missingProfileFields({
    firstName: 'Anitha',
    surname: 'Rao',
    phone: '9876543210',
    gender: 'female',
    dateOfBirth: '1998-04-02'
  }), []);
  assert.deepEqual(missingProfileFields({
    firstName: 'Anitha',
    surname: 'Rao',
    phone: '98765',
    gender: 'female',
    dateOfBirth: '2015-01-01'
  }), ['Phone', 'Date of birth (18 or older)']);
});
