import test from 'node:test';
import assert from 'node:assert/strict';
import { reactivateDeleted } from './reactivate.js';

test('reactivate puts the same profile ID back into search', () => {
  const deleted = {
    id: 'p-9',
    profileId: 'F00139',
    gender: 'female',
    approvalStatus: 'deleted',
    showInSearch: false,
    deletedAt: '2026-11-01T00:00:00.000Z',
    deletedBy: 'u-admin',
    religion: 'Christian'
  };
  const result = reactivateDeleted({ profiles: [{ id: 'p-1', profileId: 'M00001' }], deletedProfiles: [deleted], seq: 139 }, 'p-9');
  assert.equal(result.error, undefined);
  assert.equal(result.profile.profileId, 'F00139');
  assert.equal(result.profile.approvalStatus, 'approved');
  assert.equal(result.profile.showInSearch, true);
  assert.equal(result.profile.deletedAt, undefined);
  assert.equal(result.state.deletedProfiles.length, 0);
  assert.equal(result.state.profiles.find((item) => item.id === 'p-9').profileId, 'F00139');
  assert.equal(result.state.seq, 139);
});

test('a deleted profile that never had an ID returns to the waiting list', () => {
  const result = reactivateDeleted({
    profiles: [],
    deletedProfiles: [{ id: 'p-2', profileId: null, approvalStatus: 'deleted', showInSearch: false }]
  }, 'p-2');
  assert.equal(result.profile.approvalStatus, 'pending');
  assert.equal(result.profile.showInSearch, false);
  assert.equal(result.profile.profileId, null);
});

test('reactivate refuses a missing profile and a profile ID already in use', () => {
  assert.equal(reactivateDeleted({ profiles: [], deletedProfiles: [] }, 'missing').error, 'not-found');
  const result = reactivateDeleted({
    profiles: [{ id: 'p-live', profileId: 'M00125' }],
    deletedProfiles: [{ id: 'p-old', profileId: 'M00125', approvalStatus: 'deleted' }]
  }, 'p-old');
  assert.equal(result.error, 'already-active');
});
