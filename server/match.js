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
