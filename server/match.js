export function ageFromDob(dob, today = new Date()) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function genderCode(gender) {
  return String(gender || '').toLowerCase() === 'female' ? 'F' : 'M';
}

export function formatProfileId(gender, seq) {
  const n = Number(seq);
  if (!Number.isInteger(n) || n < 1 || n > 99999) {
    throw new Error('Profile sequence must be an integer from 1 to 99999');
  }
  return `${genderCode(gender)}${String(n).padStart(5, '0')}`;
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
