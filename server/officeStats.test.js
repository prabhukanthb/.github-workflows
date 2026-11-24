import test from 'node:test';
import assert from 'node:assert/strict';
import {
  genderTotals,
  matchesPick,
  profilesInScope,
  jobKey,
  profileMatchesJob,
  barsWithAtLeast,
  jobRows,
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

test('community and qualification bars keep only a side with at least 2 profiles', () => {
  const scoped = profilesInScope(profiles, 'search');
  const communities = barsWithAtLeast(religionRows(scoped));
  const hindu = communities.find((row) => row.label === 'Hindu');
  assert.equal(hindu.showMale, true);
  assert.equal(hindu.showFemale, false);
  assert.equal(communities.some((row) => row.label === 'Buddhist'), false);
  assert.equal(communities.some((row) => row.label === 'Christian'), true);
  const christian = communities.find((row) => row.label === 'Christian');
  assert.equal(christian.showMale, false);
  assert.equal(christian.showFemale, true);
  const degrees = barsWithAtLeast(qualificationRows(scoped));
  assert.deepEqual(degrees.map((row) => row.label), ['B.Tech']);
  assert.equal(degrees[0].showMale, true);
  assert.equal(degrees[0].showFemale, false);
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

test('a Telugu Christian value counts as Christian, not its own community', () => {
  const rows = religionRows(profilesInScope([
    { id: 'te', gender: 'male', religion: 'క్రైస్తవ', approvalStatus: 'approved', showInSearch: true },
    { id: 'en', gender: 'female', religion: 'Christian', approvalStatus: 'approved', showInSearch: true }
  ], 'search'));
  assert.deepEqual(rows.find((row) => row.label === 'Christian'), { label: 'Christian', male: 1, female: 1 });
  assert.equal(rows.some((row) => row.label === 'క్రైస్తవ'), false);
});

test('job rows group government, bank, and the other kinds of work', () => {
  const people = [
    { id: 'g', gender: 'male', employmentType: 'govt', occupation: 'Clerk', approvalStatus: 'approved', showInSearch: true },
    { id: 'b', gender: 'female', employmentType: 'public', occupation: 'Bank officer', approvalStatus: 'approved', showInSearch: true },
    { id: 's', gender: 'male', employmentType: 'private', occupation: 'Software engineer', approvalStatus: 'approved', showInSearch: true },
    { id: 't', gender: 'female', employmentType: 'private', occupation: 'Teacher', approvalStatus: 'approved', showInSearch: true },
    { id: 'm', gender: 'female', employmentType: 'private', occupation: 'Nurse', approvalStatus: 'approved', showInSearch: true },
    { id: 'p', gender: 'male', employmentType: 'private', occupation: 'Engineer', approvalStatus: 'approved', showInSearch: true }
  ];
  const rows = jobRows(people);
  assert.deepEqual(rows.find((row) => row.label === 'Government'), { label: 'Government', male: 1, female: 0 });
  assert.deepEqual(rows.find((row) => row.label === 'Bank'), { label: 'Bank', male: 0, female: 1 });
  assert.deepEqual(rows.find((row) => row.label === 'Software'), { label: 'Software', male: 1, female: 0 });
  assert.deepEqual(rows.find((row) => row.label === 'Teaching'), { label: 'Teaching', male: 0, female: 1 });
  assert.deepEqual(rows.find((row) => row.label === 'Medical'), { label: 'Medical', male: 0, female: 1 });
  assert.deepEqual(rows.find((row) => row.label === 'Private'), { label: 'Private', male: 1, female: 0 });
  assert.deepEqual(rows.find((row) => row.label === 'Business'), { label: 'Business', male: 0, female: 0 });
  assert.equal(jobKey({ employmentType: 'govt', occupation: 'Teacher' }), 'Government');
  assert.equal(jobKey({ occupation: 'SBI clerk' }), 'Bank');
  assert.equal(profileMatchesJob({ occupation: 'Teacher' }, 'Teaching'), true);
  assert.equal(profileMatchesJob({ occupation: 'Teacher' }, 'Bank'), false);
  assert.equal(profileMatchesJob({ occupation: 'Teacher' }, ''), true);
  assert.deepEqual(people.filter((profile) => matchesPick(profile, { kind: 'job', label: 'Bank', gender: 'female' })).map((profile) => profile.id), ['b']);
});

test('a clicked cell matches only that community or qualification and gender', () => {
  const christianFemale = profiles.filter((profile) => matchesPick(profile, { kind: 'religion', label: 'Christian', gender: 'female' }));
  const nursing = profiles.filter((profile) => matchesPick(profile, { kind: 'qualification', label: 'M.Sc. Nursing', gender: 'female' }));
  const males = profiles.filter((profile) => matchesPick(profile, { kind: 'gender', gender: 'male' }));
  assert.deepEqual(christianFemale.map((profile) => profile.id), ['5', '6']);
  assert.deepEqual(nursing.map((profile) => profile.id), ['3']);
  assert.equal(males.length, 4);
});
