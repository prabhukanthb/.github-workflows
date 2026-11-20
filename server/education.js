const DEGREE_RULES = [
  { value: 'PhD', pattern: /\bph\.?\s?d\b|\bdoctorate\b/i },
  { value: 'MDS', pattern: /\bmds\b|\bm\.d\.s\b|master of dental/i },
  { value: 'MD', pattern: /\bm\.d\b|\bmd\b|doctor of medicine/i },
  { value: 'MPT', pattern: /\bmpt\b|\bm\.pt\b/i },
  { value: 'M.Pharm', pattern: /\bm\.?\s?pharm\b/i },
  { value: 'M.Sc. Nursing', pattern: /m\.?\s?sc\.?\s*nursing/i },
  { value: 'M.Ed', pattern: /\bm\.ed\b|master of education/i },
  { value: 'M.Tech', pattern: /\bm\.?\s?tech\b/i },
  { value: 'MBA', pattern: /\bmba\b/i },
  { value: 'MCA', pattern: /\bmca\b/i },
  { value: 'LLM', pattern: /\bll\.?m\b/i },
  { value: 'GNM', pattern: /\bgnm\b/i },
  { value: 'ANM', pattern: /\banm\b/i },
  { value: 'BDS', pattern: /\bbds\b|\bb\.d\.s\b|bachelor of dental|\bdentist\b|\bdental\b/i },
  { value: 'BAMS', pattern: /\bbams\b|\bayurved/i },
  { value: 'BHMS', pattern: /\bbhms\b|\bhomeopath/i },
  { value: 'BPT', pattern: /\bbpt\b|\bphysiotherap/i },
  { value: 'MBBS', pattern: /\bmbbs\b/i },
  { value: 'B.Pharm', pattern: /\bb\.?\s?pharm\b/i },
  { value: 'B.Sc. Nursing', pattern: /b\.?\s?sc\.?\s*nursing|\bnursing\b/i },
  { value: 'LLB', pattern: /\bll\.?b\b/i },
  { value: 'B.Ed', pattern: /\bb\.ed\b|bachelor of education/i },
  { value: 'D.Ed', pattern: /\bd\.ed\b|diploma in education/i },
  { value: 'B.Arch', pattern: /\bb\.arch\b|\barchitecture\b/i },
  { value: 'BBA', pattern: /\bbba\b/i },
  { value: 'BCA', pattern: /\bbca\b/i },
  { value: 'B.Tech', pattern: /\bb\.?\s?tech\b/i },
  { value: 'CA', pattern: /chartered accountant|\bc\.a\.?\b/i }
];

export function isOtherEducation(value) {
  return /^others?$/i.test(String(value || '').trim());
}

export function qualificationFromProfile(profile) {
  const current = String(profile?.highestEducation || '').trim();
  if (!isOtherEducation(current)) return current;
  const detail = [profile.fieldOfStudy, profile.occupation, profile.jobTitle, profile.college].filter(Boolean).join(' ');
  const match = DEGREE_RULES.find((rule) => rule.pattern.test(detail));
  return match ? match.value : 'Other';
}

export function normalizeStoredEducation(state) {
  const changes = [];
  const rewrite = (list) => {
    if (!Array.isArray(list)) return list;
    let changed = false;
    const next = list.map((profile) => {
      if (!profile) return profile;
      const qualification = qualificationFromProfile(profile);
      if (qualification === String(profile.highestEducation || '').trim()) return profile;
      changed = true;
      changes.push({
        id: profile.id,
        profileId: profile.profileId || '',
        from: profile.highestEducation || '',
        to: qualification
      });
      return { ...profile, highestEducation: qualification };
    });
    return changed ? next : list;
  };
  const profiles = rewrite(state?.profiles);
  const deleted = rewrite(state?.deletedProfiles);
  if (profiles === state?.profiles && deleted === state?.deletedProfiles) {
    return { state, changes };
  }
  const next = { ...state, profiles };
  if (Array.isArray(state.deletedProfiles)) next.deletedProfiles = deleted;
  return { state: next, changes };
}
