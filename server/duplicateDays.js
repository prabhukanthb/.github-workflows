import { duplicateGroups } from './duplicates.js';
import { istDayKey, recentDayKeys } from './logins.js';
import { presentProfile } from './store.js';

export const DUPLICATE_KEEP_DAYS = 30;

function groupId(group) {
  return `${group?.reason || ''}|${group?.key || ''}`;
}

export function snapshotGroups(profiles) {
  return duplicateGroups(profiles).map((group) => ({
    reason: group.reason,
    key: group.key,
    profiles: (group.profiles || []).map((profile) => ({
      id: profile.id,
      name: [profile.firstName, profile.surname || profile.lastName].filter(Boolean).join(' ') || 'Member',
      profileId: profile.profileId || ''
    }))
  }));
}

export function recordDuplicateDay(state, profiles, now = new Date()) {
  const day = istDayKey(now);
  const groups = snapshotGroups(profiles);
  const allowed = new Set(recentDayKeys(now));
  const previous = state?.duplicateDays || [];
  const kept = previous.filter((item) => item?.day !== day && allowed.has(item.day));
  const existing = previous.find((item) => item?.day === day);
  const sameGroups = existing && JSON.stringify(existing.groups) === JSON.stringify(groups);
  const sameList = Boolean(existing) && kept.length + 1 === previous.length;
  if (sameGroups && sameList) return state;
  return {
    ...state,
    duplicateDays: [...kept, { day, recordedAt: now.toISOString(), groups }]
  };
}

export function withDuplicateSnapshot(state, now = new Date()) {
  const profiles = [...(state?.profiles || []), ...(state?.deletedProfiles || [])]
    .map((item) => presentProfile(item, state?.users || [], { contact: true }));
  return recordDuplicateDay(state, profiles, now);
}

function changes(previous, current) {
  const before = new Map((previous?.groups || []).map((group) => [groupId(group), group]));
  const after = new Map((current?.groups || []).map((group) => [groupId(group), group]));
  return {
    added: [...after.entries()].filter(([key]) => !before.has(key)).map(([, group]) => group),
    cleared: [...before.entries()].filter(([key]) => !after.has(key)).map(([, group]) => group)
  };
}

export function duplicateReport(state, day, now = new Date()) {
  const savedDays = state?.duplicateDays || [];
  const keys = recentDayKeys(now);
  const wanted = keys.includes(day) ? day : istDayKey(now);
  const days = keys.map((key) => {
    const saved = savedDays.find((item) => item.day === key);
    return { day: key, count: saved ? saved.groups.length : 0, saved: Boolean(saved) };
  });
  const current = savedDays.find((item) => item.day === wanted) || null;
  const previousKey = keys.find((key) => key < wanted && savedDays.some((item) => item.day === key)) || '';
  const previous = previousKey ? savedDays.find((item) => item.day === previousKey) : null;
  const diff = current && previous ? changes(previous, current) : { added: [], cleared: [] };
  return {
    day: wanted,
    saved: Boolean(current),
    recordedAt: current?.recordedAt || '',
    count: current?.groups.length || 0,
    groups: current?.groups || [],
    days,
    comparedWith: previousKey,
    added: diff.added,
    cleared: diff.cleared
  };
}
