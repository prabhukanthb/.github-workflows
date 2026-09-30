import test from 'node:test';
import assert from 'node:assert/strict';
import { ageFromDob, cityMatches, formatProfileId, isOppositeMatch } from './match.js';

test('formatProfileId pads gender and sequence', () => {
  assert.equal(formatProfileId('female', 1), 'F00001');
  assert.equal(formatProfileId('male', 42), 'M00042');
});

test('a bride sees only older grooms', () => {
  const bride = { gender: 'female', dateOfBirth: '2000-06-01' };
  const today = new Date('2026-09-28');
  assert.equal(isOppositeMatch(bride, { gender: 'male', dateOfBirth: '1998-01-01' }, today), true);
  assert.equal(isOppositeMatch(bride, { gender: 'male', dateOfBirth: '2002-01-01' }, today), false);
  assert.equal(isOppositeMatch(bride, { gender: 'female', dateOfBirth: '1995-01-01' }, today), false);
});

test('a candidate is 18 on that birthday and 17 the day before', () => {
  const today = new Date(2026, 8, 30);
  assert.equal(ageFromDob('2008-09-30', today), 18);
  assert.equal(ageFromDob('2008-10-01', today), 17);
});

test('a groom sees brides of the same age or younger', () => {
  const groom = { gender: 'male', dateOfBirth: '1996-01-15' };
  const today = new Date('2026-09-28');
  assert.equal(ageFromDob(groom.dateOfBirth, today), 30);
  assert.equal(isOppositeMatch(groom, { gender: 'female', dateOfBirth: '1998-04-01' }, today), true);
  assert.equal(isOppositeMatch(groom, { gender: 'female', dateOfBirth: '1990-04-01' }, today), false);
});

test('city search accepts common spellings', () => {
  const profile = { currentAddress: { city: 'Bengaluru' }, jobLocation: '' };
  assert.equal(cityMatches(profile, 'Bangalore'), true);
  assert.equal(cityMatches(profile, 'Guntur'), false);
  assert.equal(cityMatches({ jobLocation: 'United States' }, 'NRI'), true);
});
