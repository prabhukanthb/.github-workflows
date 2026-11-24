import test from 'node:test';
import assert from 'node:assert/strict';
import { duplicateGroups } from './duplicates.js';

test('duplicate profiles are the ones that share a phone, email, or name and date of birth', () => {
  const groups = duplicateGroups([
    { id: 'a', firstName: 'Roshan', surname: 'Kongala', phone: '9000000001', email: 'one@example.com', dateOfBirth: '1995-01-01', profileId: 'M00011' },
    { id: 'b', firstName: 'ROSHAN', surname: 'KONGALA', phone: '9000000099', email: 'two@example.com', dateOfBirth: '1995-01-01', profileId: 'M00012' },
    { id: 'c', firstName: 'Ravi', surname: 'Gadde', phone: '9000000001', email: 'three@example.com', dateOfBirth: '1990-02-02', profileId: 'M00013' },
    { id: 'd', firstName: 'Suneetha', surname: 'Dasari', phone: '9000000004', email: 'one@example.com', dateOfBirth: '1992-03-03', profileId: 'F00014' },
    { id: 'e', firstName: 'Kavya', surname: 'Sri', phone: '9000000005', email: 'kavya@example.com', dateOfBirth: '1996-04-04', profileId: 'F00015' }
  ]);
  const reasons = groups.map((group) => group.reason);
  assert.deepEqual(reasons, ['Same phone', 'Same email', 'Same name and date of birth']);
  assert.deepEqual(groups[0].profiles.map((item) => item.id), ['a', 'c']);
  assert.deepEqual(groups[2].profiles.map((item) => item.id), ['a', 'b']);
});
