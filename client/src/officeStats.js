import { RELIGIONS, communityLabel } from './siteConfig.js';

export function religionKey(profile) {
  return communityLabel(profile?.religion) || 'Not given';
}

export function qualificationKey(profile) {
  return String(profile?.highestEducation || '').trim() || 'Not given';
}

export function profilesInScope(profiles, scope) {
  const list = profiles || [];
  if (scope === 'all') return list.filter((profile) => profile.approvalStatus !== 'deleted');
  return list.filter((profile) => profile.approvalStatus === 'approved' && profile.showInSearch !== false);
}

function rowsFor(profiles, keyFn, labels) {
  const names = [...labels];
  for (const profile of profiles) {
    const key = keyFn(profile);
    if (!names.includes(key)) names.push(key);
  }
  return names.map((label) => ({
    label,
    male: profiles.filter((profile) => keyFn(profile) === label && profile.gender === 'male').length,
    female: profiles.filter((profile) => keyFn(profile) === label && profile.gender === 'female').length
  }));
}

export function religionRows(profiles) {
  const rows = rowsFor(profiles, religionKey, RELIGIONS);
  const known = RELIGIONS.map((label) => rows.find((row) => row.label === label));
  const extras = rows.filter((row) => !RELIGIONS.includes(row.label) && row.label !== 'Not given');
  const missing = rows.find((row) => row.label === 'Not given');
  return missing && missing.male + missing.female > 0 ? [...known, ...extras, missing] : [...known, ...extras];
}

export function qualificationRows(profiles) {
  return rowsFor(profiles, qualificationKey, [])
    .filter((row) => row.male + row.female > 0)
    .sort((a, b) => (b.male + b.female) - (a.male + a.female) || a.label.localeCompare(b.label));
}

export function genderTotals(profiles) {
  return {
    male: (profiles || []).filter((profile) => profile.gender === 'male').length,
    female: (profiles || []).filter((profile) => profile.gender === 'female').length
  };
}

export function samePick(a, b) {
  if (!a || !b) return false;
  return a.kind === b.kind && a.label === b.label && a.gender === b.gender;
}

export function matchesPick(profile, pick) {
  if (!pick) return false;
  if (pick.gender && profile.gender !== pick.gender) return false;
  if (pick.kind === 'religion' && religionKey(profile) !== pick.label) return false;
  if (pick.kind === 'qualification' && qualificationKey(profile) !== pick.label) return false;
  return true;
}

export function pickTitle(pick) {
  if (!pick) return '';
  const who = pick.gender === 'female' ? 'Female' : pick.gender === 'male' ? 'Male' : '';
  if (pick.kind === 'gender') return who;
  return [pick.label, who].filter(Boolean).join(' · ');
}
