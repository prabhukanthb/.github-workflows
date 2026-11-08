import test from 'node:test';
import assert from 'node:assert/strict';
import { ageFromDob, cityMatches, communityMatches, formatProfileId, interestIsCurrent, isOppositeMatch, nextProfileSequence, normalizePhotos } from './match.js';

test('formatProfileId pads gender and sequence', () => {
  assert.equal(formatProfileId('female', 1), 'F00001');
  assert.equal(formatProfileId('male', 42), 'M00042');
});

test('a deleted profile id is not issued again', () => {
  const seq = nextProfileSequence({
    seq: 12,
    profiles: [{ profileId: 'F00013' }],
    deletedProfiles: [{ profileId: 'F00012' }]
  });
  assert.equal(seq, 14);
  assert.notEqual(formatProfileId('female', seq), 'F00012');
});

test('only one of three photos is the main photo', () => {
  const photos = normalizePhotos([
    { url: 'https://example.com/a.jpg', isPrimary: false },
    { url: 'https://example.com/b.jpg', isPrimary: true },
    { url: 'https://example.com/c.jpg', isPrimary: true },
    { url: 'https://example.com/d.jpg', isPrimary: false }
  ]);
  assert.equal(photos.length, 3);
  assert.deepEqual(photos.map((photo) => photo.isPrimary), [false, true, false]);
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

test('Christian and Hindu search stay within that community and every other community sees all', () => {
  assert.equal(communityMatches('Christian', 'Christian'), true);
  assert.equal(communityMatches('Christian', 'Hindu'), false);
  assert.equal(communityMatches('Christian', 'Christian/Hindu'), false);
  assert.equal(communityMatches('Hindu', 'Hindu'), true);
  assert.equal(communityMatches('Hindu', 'Christian'), false);
  assert.equal(communityMatches('Christian/Hindu', 'Christian'), true);
  assert.equal(communityMatches('Christian/Hindu', 'Hindu'), true);
  assert.equal(communityMatches('Christian/Hindu', 'Buddhist'), true);
  assert.equal(communityMatches('Ambedkarist', 'Hindu'), true);
  assert.equal(communityMatches('Buddhist', 'Christian'), true);
  assert.equal(communityMatches('Other', 'Christian'), true);
  assert.equal(communityMatches('Christian', ''), false);
});

test('an interest notification lasts 7 days', () => {
  const now = new Date('2026-11-08T12:00:00.000Z');
  assert.equal(interestIsCurrent('2026-11-08T11:00:00.000Z', now), true);
  assert.equal(interestIsCurrent('2026-11-01T12:00:01.000Z', now), true);
  assert.equal(interestIsCurrent('2026-11-01T12:00:00.000Z', now), false);
  assert.equal(interestIsCurrent('2026-10-01T12:00:00.000Z', now), false);
  assert.equal(interestIsCurrent('', now), false);
});

test('city search accepts common spellings', () => {
  const profile = { currentAddress: { city: 'Bengaluru' }, jobLocation: '' };
  assert.equal(cityMatches(profile, 'Bangalore'), true);
  assert.equal(cityMatches(profile, 'Guntur'), false);
  assert.equal(cityMatches({ jobLocation: 'United States' }, 'NRI'), true);
});
