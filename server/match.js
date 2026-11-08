export function ageFromDob(dob, today = new Date()) {
  if (!dob) return null;
  const match = String(dob).match(/^(\d{4})-(\d{2})-(\d{2})/);
  let year;
  let month;
  let day;
  if (match) {
    year = Number(match[1]);
    month = Number(match[2]) - 1;
    day = Number(match[3]);
  } else {
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return null;
    year = birth.getFullYear();
    month = birth.getMonth();
    day = birth.getDate();
  }
  let age = today.getFullYear() - year;
  const monthGap = today.getMonth() - month;
  if (monthGap < 0 || (monthGap === 0 && today.getDate() < day)) age -= 1;
  return age;
}

export function genderCode(gender) {
  return String(gender || '').toLowerCase() === 'female' ? 'F' : 'M';
}

export function normalizePhotos(input) {
  const source = Array.isArray(input) ? input : [];
  const photos = [];
  for (const item of source) {
    const url = String(item?.url || '').trim();
    if (!url || photos.some((photo) => photo.url === url)) continue;
    photos.push({ url, isPrimary: Boolean(item?.isPrimary) });
    if (photos.length === 3) break;
  }
  if (!photos.length) return [];
  const primaryIndex = photos.findIndex((photo) => photo.isPrimary);
  return photos.map((photo, index) => ({
    url: photo.url,
    isPrimary: primaryIndex === -1 ? index === 0 : index === primaryIndex
  }));
}

function profileNumber(profileId) {
  const match = String(profileId || '').match(/^([MF])(\d{1,5})$/i);
  if (!match) return null;
  return { code: match[1].toUpperCase(), seq: Number(match[2]) };
}

function rememberProfileId(profileId, used) {
  const parsed = profileNumber(profileId);
  if (parsed) {
    used.add(parsed.seq);
    return;
  }
  const match = String(profileId || '').match(/(\d+)$/);
  if (match) used.add(Number(match[1]));
}

export function nextProfileSequence(state) {
  const used = new Set();
  for (const item of [...(state?.profiles || []), ...(state?.deletedProfiles || [])]) {
    rememberProfileId(item?.profileId, used);
    for (const oldId of item?.retiredProfileIds || []) rememberProfileId(oldId, used);
  }
  let seq = Number(state?.seq) || 0;
  do {
    seq += 1;
  } while (used.has(seq) && seq < 100000);
  if (seq > 99999) throw new Error('No profile IDs left.');
  return seq;
}

function profileIdTaken(state, profileId, exceptId) {
  const wanted = String(profileId || '');
  if (!wanted) return false;
  for (const item of [...(state?.profiles || []), ...(state?.deletedProfiles || [])]) {
    if (exceptId && item?.id === exceptId) continue;
    if (item?.profileId === wanted) return true;
    if ((item?.retiredProfileIds || []).includes(wanted)) return true;
  }
  return false;
}

export function profileIdForGender(state, profile) {
  const gender = String(profile?.gender || '').toLowerCase();
  const currentId = profile?.profileId || null;
  const retired = Array.isArray(profile?.retiredProfileIds) ? profile.retiredProfileIds.filter(Boolean) : [];
  const seq = Number(state?.seq) || 0;
  const unchanged = { profileId: currentId, retiredProfileIds: retired, seq };
  if (gender !== 'male' && gender !== 'female') return unchanged;
  const parsed = profileNumber(currentId);
  if (!parsed) return unchanged;
  if (parsed.code === genderCode(gender)) return unchanged;
  const swapped = formatProfileId(gender, parsed.seq);
  const remember = (nextId) => [...retired.filter((id) => id !== nextId), currentId];
  if (!profileIdTaken(state, swapped, profile?.id)) {
    return { profileId: swapped, retiredProfileIds: remember(swapped), seq };
  }
  const nextSeq = nextProfileSequence(state);
  return {
    profileId: formatProfileId(gender, nextSeq),
    retiredProfileIds: remember(formatProfileId(gender, nextSeq)),
    seq: nextSeq
  };
}

export function alignProfileIds(state) {
  if (!state?.profiles?.length) return state;
  let seq = Number(state.seq) || 0;
  let changed = false;
  const profiles = [];
  let working = state;
  for (const profile of state.profiles) {
    const result = profileIdForGender(working, profile);
    const retired = result.retiredProfileIds || [];
    const previous = profile.retiredProfileIds || [];
    const sameRetired = retired.length === previous.length && retired.every((id, index) => id === previous[index]);
    if ((result.profileId || null) === (profile.profileId || null) && sameRetired) {
      profiles.push(profile);
      continue;
    }
    changed = true;
    const nextProfile = { ...profile, profileId: result.profileId };
    if (retired.length) nextProfile.retiredProfileIds = retired;
    else delete nextProfile.retiredProfileIds;
    profiles.push(nextProfile);
    seq = Math.max(seq, Number(result.seq) || 0);
    working = {
      ...working,
      seq,
      profiles: (working.profiles || []).map((item) => (item.id === profile.id ? nextProfile : item))
    };
  }
  if (!changed) return state;
  return { ...state, seq, profiles };
}

export function formatProfileId(gender, seq) {
  const n = Number(seq);
  if (!Number.isInteger(n) || n < 1 || n > 99999) {
    throw new Error('Profile sequence must be an integer from 1 to 99999');
  }
  return `${genderCode(gender)}${String(n).padStart(5, '0')}`;
}

function communityName(value) {
  const text = String(value || '').trim();
  return text === 'Other' ? 'Christian/Hindu' : text;
}

export function communityMatches(viewerReligion, candidateReligion) {
  const viewer = communityName(viewerReligion);
  const candidate = communityName(candidateReligion);
  if (viewer === 'Christian') return candidate === 'Christian';
  if (viewer === 'Hindu') return candidate === 'Hindu';
  return true;
}

export const INTEREST_DAYS = 7;
const INTEREST_WINDOW_MS = INTEREST_DAYS * 24 * 60 * 60 * 1000;

export function interestIsCurrent(createdAt, now = new Date()) {
  const created = Date.parse(createdAt || '');
  if (!Number.isFinite(created)) return false;
  const age = now.getTime() - created;
  return age >= 0 && age < INTEREST_WINDOW_MS;
}

export function isOppositeMatch(viewer, candidate, today = new Date()) {
  if (!viewer || !candidate) return false;
  const viewerAge = ageFromDob(viewer.dateOfBirth, today);
  const candidateAge = ageFromDob(candidate.dateOfBirth, today);
  if (!viewerAge || !candidateAge) return false;
  if (viewer.gender === 'female') {
    return candidate.gender === 'male' && candidateAge > viewerAge;
  }
  if (viewer.gender === 'male') {
    return candidate.gender === 'female' && candidateAge <= viewerAge;
  }
  return false;
}

const CITY_ALIASES = {
  bangalore: ['bangalore', 'bengaluru'],
  rajahmundry: ['rajahmundry', 'rajamundry'],
  visakhapatnam: ['visakhapatnam', 'vishakapatnam', 'vizag']
};

export function cityMatches(profile, city) {
  const wanted = String(city || '').trim().toLowerCase();
  if (!wanted) return true;
  const hay = [
    profile.currentAddress?.city,
    profile.presentAddress?.city,
    profile.jobLocation
  ].filter(Boolean).join(' ').toLowerCase();
  if (wanted === 'nri') {
    return /nri|abroad|usa|uk|canada|dubai|singapore|united states|america/.test(hay);
  }
  const needles = CITY_ALIASES[wanted] || [wanted];
  return needles.some((n) => hay.includes(n));
}

export function fullName(profile) {
  return [profile?.firstName, profile?.lastName || profile?.surname]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ');
}
