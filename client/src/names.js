export function properName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.split(/([-'])/).map((part) => {
      if (part === '-' || part === "'") return part;
      if (!part) return '';
      const lower = part.toLocaleLowerCase('en-IN');
      return lower.charAt(0).toLocaleUpperCase('en-IN') + lower.slice(1);
    }).join(''))
    .join(' ');
}

export function nameFields(firstName, surname) {
  const first = properName(firstName);
  const last = properName(surname);
  return { firstName: first, surname: last, lastName: last };
}

function sameUserName(user, next) {
  return next.firstName === String(user?.firstName || '')
    && next.surname === String(user?.surname || '')
    && next.lastName === String(user?.lastName || '');
}

function namedProfile(profile) {
  if (!profile) return profile;
  const fatherName = properName(profile.fatherName);
  const motherName = properName(profile.motherName);
  if (fatherName === String(profile.fatherName || '') && motherName === String(profile.motherName || '')) return profile;
  return { ...profile, fatherName, motherName };
}

export function normalizeStoredNames(state) {
  let userChanged = false;
  const users = (state?.users || []).map((user) => {
    const next = { ...user, ...nameFields(user?.firstName, user?.surname || user?.lastName) };
    if (sameUserName(user, next)) return user;
    userChanged = true;
    return next;
  });
  let profileChanged = false;
  const rewrite = (list) => (list || []).map((profile) => {
    const next = namedProfile(profile);
    if (next !== profile) profileChanged = true;
    return next;
  });
  const profiles = rewrite(state?.profiles);
  const deletedProfiles = rewrite(state?.deletedProfiles);
  if (!userChanged && !profileChanged) return state;
  const next = { ...state };
  if (userChanged) next.users = users;
  if (profileChanged && Array.isArray(state?.profiles)) next.profiles = profiles;
  if (profileChanged && Array.isArray(state?.deletedProfiles)) next.deletedProfiles = deletedProfiles;
  return next;
}
