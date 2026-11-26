import { properName } from './names.js';

function phoneKey(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length > 10) return digits.slice(-10);
  return '';
}

function add(map, key, profile) {
  if (!key || !profile) return;
  const list = map.get(key) || [];
  if (!list.some((item) => item.id === profile.id)) list.push(profile);
  map.set(key, list);
}

function groupsFrom(map, reason) {
  return [...map.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([key, items]) => ({ reason, key, profiles: items }));
}

export function duplicateGroups(profiles = []) {
  const byPhone = new Map();
  const byEmail = new Map();
  const byIdentity = new Map();
  const byProfileId = new Map();
  for (const profile of profiles) {
    if (!profile) continue;
    add(byPhone, phoneKey(profile.phone), profile);
    add(byPhone, phoneKey(profile.alternativePhone), profile);
    add(byEmail, String(profile.email || '').trim().toLowerCase(), profile);
    const name = [properName(profile.firstName), properName(profile.surname || profile.lastName)].filter(Boolean).join(' ');
    const dob = String(profile.dateOfBirth || '').slice(0, 10);
    if (name.length > 3 && dob) add(byIdentity, `${name}|${dob}`, profile);
    add(byProfileId, String(profile.profileId || '').trim(), profile);
  }
  return [
    ...groupsFrom(byPhone, 'Same phone'),
    ...groupsFrom(byEmail, 'Same email'),
    ...groupsFrom(byIdentity, 'Same name and date of birth'),
    ...groupsFrom(byProfileId, 'Same profile ID')
  ];
}
