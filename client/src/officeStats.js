import { RELIGIONS, communityLabel } from './siteConfig.js';

export function religionKey(profile) {
  return communityLabel(profile?.religion) || 'Not given';
}

export function qualificationKey(profile) {
  return String(profile?.highestEducation || '').trim() || 'Not given';
}

export const JOBS = ['Government', 'Bank', 'Software', 'Teaching', 'Medical', 'Business', 'Private', 'Self employed'];

export function jobKey(profile) {
  const text = [profile?.occupation, profile?.jobTitle, profile?.companyName, profile?.industry].filter(Boolean).join(' ');
  const type = String(profile?.employmentType || '').toLowerCase();
  if (/\bbank|banker|\bsbi\b|\bhdfc\b|\bicici\b|\baxis bank\b|\bcanara\b/i.test(text)) return 'Bank';
  if (type === 'govt' || /\bgovernment\b|\bgovt\b|\brailway\b|\bpolice\b|\barmy\b|\bnavy\b|\bdefence\b|\bdefense\b|\bconstable\b/i.test(text)) return 'Government';
  if (/\bsoftware\b|\bdeveloper\b|\bprogrammer\b|\bit professional\b|\binformation technology\b/i.test(text)) return 'Software';
  if (/\bteach|\blecturer\b|\bprofessor\b|\btutor\b|\bprincipal\b/i.test(text)) return 'Teaching';
  if (/\bdoctor\b|\bnurse\b|\bdentist\b|\bpharmacist\b|\bhospital\b|\bmbbs\b|\bphysiotherap/i.test(text)) return 'Medical';
  if (type === 'business' || /\bbusiness\b|\bproprietor\b|\bentrepreneur\b/i.test(text)) return 'Business';
  if (type === 'self-employed' || type === 'self employed') return 'Self employed';
  if (type === 'private') return 'Private';
  if (type === 'public') return 'Public';
  if (text.trim()) return 'Other work';
  return 'Not given';
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

export function profileMatchesJob(profile, job) {
  const wanted = String(job || '').trim();
  if (!wanted) return true;
  return jobKey(profile) === wanted;
}

export const JOB_FILTERS = [...JOBS, 'Public', 'Other work'];

export function jobRows(profiles) {
  const rows = rowsFor(profiles, jobKey, JOBS);
  const known = JOBS.map((label) => rows.find((row) => row.label === label));
  const extras = rows.filter((row) => !JOBS.includes(row.label) && row.label !== 'Not given' && row.male + row.female > 0);
  const missing = rows.find((row) => row.label === 'Not given');
  return missing && missing.male + missing.female > 0 ? [...known, ...extras, missing] : [...known, ...extras];
}

export function barsWithAtLeast(rows, minimum = 2) {
  return (rows || [])
    .map((row) => ({
      ...row,
      showMale: row.male >= minimum,
      showFemale: row.female >= minimum
    }))
    .filter((row) => row.showMale || row.showFemale);
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
  if (pick.kind === 'job' && jobKey(profile) !== pick.label) return false;
  return true;
}

export function pickTitle(pick) {
  if (!pick) return '';
  const who = pick.gender === 'female' ? 'Female' : pick.gender === 'male' ? 'Male' : '';
  if (pick.kind === 'gender') return who;
  return [pick.label, who].filter(Boolean).join(' · ');
}
