import test from 'node:test';
import assert from 'node:assert/strict';
import { duplicateReport, recordDuplicateDay } from './duplicateDays.js';

const noon = new Date('2026-11-25T06:30:00.000Z');
const nextNoon = new Date('2026-11-26T06:30:00.000Z');

function pair(id, name, phone) {
  const [firstName, surname] = name.split(' ');
  return { id, firstName, surname, phone, email: `${id}@example.com`, dateOfBirth: '1995-01-01', profileId: id.toUpperCase() };
}

test('today’s duplicate list replaces the same day and a day older than 30 is removed', () => {
  const old = new Date(noon.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const first = recordDuplicateDay({
    duplicateDays: [{ day: old, recordedAt: noon.toISOString(), groups: [] }]
  }, [
    pair('a', 'Anitha Rao', '9000000001'),
    pair('b', 'Roshan Kongala', '9000000001')
  ], noon);
  assert.equal(first.duplicateDays.some((item) => item.day === old), false);
  assert.equal(first.duplicateDays[0].day, '2026-11-25');
  assert.equal(first.duplicateDays[0].groups.length, 1);
  const again = recordDuplicateDay(first, [
    pair('a', 'Anitha Rao', '9000000001'),
    pair('b', 'Roshan Kongala', '9000000001')
  ], noon);
  assert.equal(again, first);
  const next = recordDuplicateDay(first, [pair('a', 'Anitha Rao', '9000000001')], nextNoon);
  const report = duplicateReport(next, '2026-11-26', nextNoon);
  assert.equal(report.saved, true);
  assert.equal(report.count, 0);
  assert.equal(report.comparedWith, '2026-11-25');
  assert.equal(report.cleared.length, 1);
  assert.equal(report.cleared[0].reason, 'Same phone');
  assert.equal(report.added.length, 0);
  const missing = duplicateReport(next, '2026-11-24', nextNoon);
  assert.equal(missing.saved, false);
  assert.equal(missing.groups.length, 0);
});
