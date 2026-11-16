import test from 'node:test';
import assert from 'node:assert/strict';
import { EDUCATION } from '../client/src/siteConfig.js';
import { normalizeStoredEducation, qualificationFromProfile } from './education.js';

test('the education list includes dental and the other professional courses', () => {
  for (const degree of ['BDS', 'MDS', 'BAMS', 'BHMS', 'BPT', 'MPT', 'LLB', 'LLM', 'B.Ed', 'M.Ed', 'D.Ed', 'BBA', 'BCA', 'B.Arch', 'GNM', 'ANM', 'CA', 'MD']) {
    assert.equal(EDUCATION.includes(degree), true, degree);
  }
  assert.equal(EDUCATION.at(-1), 'Other');
  assert.equal(EDUCATION.includes('10th Pass'), false);
  assert.equal(EDUCATION.includes('12th Pass'), false);
});

test('a profile marked Other is updated from the degree named on the profile', () => {
  assert.equal(qualificationFromProfile({ highestEducation: 'Other', fieldOfStudy: 'Dental' }), 'BDS');
  assert.equal(qualificationFromProfile({ highestEducation: 'others', occupation: 'Dentist' }), 'BDS');
  assert.equal(qualificationFromProfile({ highestEducation: 'Other', fieldOfStudy: 'MDS Orthodontics' }), 'MDS');
  assert.equal(qualificationFromProfile({ highestEducation: 'Other', jobTitle: 'B.Ed teacher' }), 'B.Ed');
  assert.equal(qualificationFromProfile({ highestEducation: 'Other', college: 'GNM School of Nursing' }), 'GNM');
  assert.equal(qualificationFromProfile({ highestEducation: 'Other', fieldOfStudy: 'Commerce' }), 'Other');
  assert.equal(qualificationFromProfile({ highestEducation: 'B.Tech', fieldOfStudy: 'Dental' }), 'B.Tech');
});

test('stored Other qualifications are rewritten and a specific degree is left alone', () => {
  const state = {
    profiles: [
      { id: 'p-dental', profileId: 'F00901', highestEducation: 'Other', fieldOfStudy: 'BDS' },
      { id: 'p-known', profileId: 'M00902', highestEducation: 'MBA', fieldOfStudy: 'Finance' }
    ],
    deletedProfiles: [
      { id: 'p-old', profileId: 'F00903', highestEducation: 'Others', occupation: 'Ayurveda doctor' }
    ]
  };
  const { state: next, changes } = normalizeStoredEducation(state);
  assert.equal(next.profiles[0].highestEducation, 'BDS');
  assert.equal(next.profiles[1].highestEducation, 'MBA');
  assert.equal(next.deletedProfiles[0].highestEducation, 'BAMS');
  assert.deepEqual(changes.map((item) => item.profileId), ['F00901', 'F00903']);
  assert.equal(normalizeStoredEducation(next).state, next);
});
