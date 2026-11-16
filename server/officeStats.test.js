import test from 'node:test';
import assert from 'node:assert/strict';
import {
  genderTotals,
  matchesPick,
  profilesInScope,
  qualificationRows,
  religionRows
} from '../client/src/officeStats.js';

const profiles = [
  { id: '1', gender: 'male', religion: 'Hindu', highestEducation: 'B.Tech', approvalStatus: 'approved', showInSearch: true },
  { id: '2', gender: 'male', religion: 'Hindu', highestEducation: 'B.Tech', approvalStatus: 'approved', showInSearch: true },
  { id: '3', gender: 'female', religion: 'Hindu', highestEducation: 'M.Sc. Nursing', approvalStatus: 'approved', showInSearch: true },
  { id: '4', gender: 'male', religion: 'Christian', highestEducation: 'B.Pharm', approvalStatus: 'approved', showInSearch: true },
  { id: '5', gender: 'female', religion: 'Christian', highestEducation: '', approvalStatus: 'approved', showInSearch: true },
  { id: '6', gender: 'female', religion: 'Christian', highestEducation: 'MBA', approvalStatus: 'approved', showInSearch: true },
  { id: '7', gender: 'female', religion: 'Other', highestEducation: 'B.A', approvalStatus: 'approved', showInSearch: true },
  { id: '8', gender: 'male', religion: 'Hindu', highestEducation: 'MBA', approvalStatus: 'pending', showInSearch: false },
  { id: '9', gender: 'female', religion: '', highestEducation: 'PhD', approvalStatus: 'approved', showInSearch: true }
];

test('religion rows count male and female, including a community with nobody', () => {
  const rows = religionRows(profilesInScope(profiles, 'search'));
  const hindu = rows.find((row) => row.label === 'Hindu');
  const christian = rows.find((row) => row.label === 'Christian');
  const both = rows.find((row) => row.label === 'Christian/Hindu');
  const buddhist = rows.find((row) => row.label === 'Buddhist');
  const missing = rows.find((row) => row.label === 'Not given');
  assert.deepEqual(hindu, { label: 'Hindu', male: 2, female: 1 });
  assert.deepEqual(christian, { label: 'Christian', male: 1, female: 2 });
  assert.deepEqual(both, { label: 'Christian/Hindu', male: 0, female: 1 });
  assert.deepEqual(buddhist, { label: 'Buddhist', male: 0, female: 0 });
  assert.deepEqual(missing, { label: 'Not given', male: 0, female: 1 });
});

test('qualification rows list only groups that have someone, largest first', () => {
  const rows = qualificationRows(profilesInScope(profiles, 'search'));
  assert.deepEqual(rows[0], { label: 'B.Tech', male: 2, female: 0 });
  assert.equal(rows.find((row) => row.label === 'Not given').female, 1);
  assert.equal(rows.some((row) => row.label === 'Diploma'), false);
});

test('search scope leaves out profiles that are not in search', () => {
  const scoped = profilesInScope(profiles, 'search');
  assert.equal(scoped.some((profile) => profile.id === '8'), false);
  assert.deepEqual(genderTotals(scoped), { male: 3, female: 5 });
  assert.equal(profilesInScope(profiles, 'all').length, 9);
});

test('a clicked cell matches only that community or qualification and gender', () => {
  const christianFemale = profiles.filter((profile) => matchesPick(profile, { kind: 'religion', label: 'Christian', gender: 'female' }));
  const nursing = profiles.filter((profile) => matchesPick(profile, { kind: 'qualification', label: 'M.Sc. Nursing', gender: 'female' }));
  const males = profiles.filter((profile) => matchesPick(profile, { kind: 'gender', gender: 'male' }));
  assert.deepEqual(christianFemale.map((profile) => profile.id), ['5', '6']);
  assert.deepEqual(nursing.map((profile) => profile.id), ['3']);
  assert.equal(males.length, 4);
});
