import test from 'node:test';
import assert from 'node:assert/strict';
import { nameFields, normalizeStoredNames, properName } from './names.js';

test('a name keeps one capital letter at the start of each word', () => {
  assert.equal(properName('ROSHAN KONGALA'), 'Roshan Kongala');
  assert.equal(properName('Koteswara Sriharsha GUDAPATI'), 'Koteswara Sriharsha Gudapati');
  assert.equal(properName('RAVI TEJA GADDE'), 'Ravi Teja Gadde');
  assert.equal(properName('venkata thakkilla'), 'Venkata Thakkilla');
  assert.equal(properName('  mridula   maddu '), 'Mridula Maddu');
  assert.equal(properName("mary-anne o'neil"), "Mary-Anne O'Neil");
  assert.equal(nameFields('RAVI TEJA', 'GADDE').firstName, 'Ravi Teja');
  assert.equal(nameFields('RAVI TEJA', 'GADDE').surname, 'Gadde');
});

test('stored names are rewritten once and a correct name is left as it is', () => {
  const state = {
    users: [
      { id: 'u1', firstName: 'ROSHAN', surname: 'KONGALA', lastName: 'KONGALA' },
      { id: 'u2', firstName: 'Suneetha', surname: 'Dasari', lastName: 'Dasari' }
    ],
    profiles: [
      { id: 'p1', userId: 'u1', fatherName: 'KRISHNA', motherName: 'Lakshmi' }
    ]
  };
  const next = normalizeStoredNames(state);
  assert.equal(next.users[0].firstName, 'Roshan');
  assert.equal(next.users[0].surname, 'Kongala');
  assert.equal(next.users[1], state.users[1]);
  assert.equal(next.profiles[0].fatherName, 'Krishna');
  assert.equal(next.profiles[0].motherName, 'Lakshmi');
  assert.equal(normalizeStoredNames(next), next);
});
