export const BRAND = 'Telugu Kalyanamala';
export const MOTTO = 'Introduction is Ours - Inspection is yours';
export const ORG = 'Kalyanamala Seva Samstha';
export const YEARS_OF_SERVICE = 15;
export const REGISTRATION_FEE = '₹3,000/-';
export const REGISTER_CTA = 'Register';
export const HELPLINE_DISPLAY = '94405 45049';
export const HELPLINE_TEL = 'tel:+919440545049';
export const WHATSAPP_HREF = 'https://wa.me/919440545049';
export const EMAIL = 'office@newkalyanamala.org';
export const BRANCH_ADDRESS_LINES = [
  '31-12-9/1, Manohara Apartments',
  'Machavaram Down, Machavaram',
  'Vijayawada, Andhra Pradesh 520004'
];
export const MAP_EMBED =
  'https://maps.google.com/maps?q=31-12-9%2F1%2C%20Manohara%20Apartments%2C%20Machavaram%20Down%2C%20Vijayawada%2C%20Andhra%20Pradesh%20520004&z=17&output=embed';

export const CITIES = [
  'Vijayawada',
  'Guntur',
  'Gudivada',
  'Rajahmundry',
  'Visakhapatnam',
  'Chirala',
  'Ongole',
  'Nellore',
  'Hyderabad',
  'Chennai',
  'Bangalore',
  'NRI'
];

export const MOTHER_TONGUES = ['Telugu', 'Tamil', 'Kannada', 'Hindi', 'English'];

export const SUB_COMMUNITIES = [
  { label: 'Any', value: '' },
  { label: 'Hindu Mala', value: 'Hindu' },
  { label: 'Christian Mala', value: 'Christian' },
  { label: 'Ambedkarist', value: 'Ambedkarist' },
  { label: 'Buddhist', value: 'Buddhist' }
];

export const RELIGIONS = ['Hindu', 'Christian', 'Ambedkarist', 'Buddhist', 'Other'];
export const EDUCATION = ['10th Pass', '12th Pass', 'Diploma', 'ITI', 'B.A', 'B.Sc', 'B.Com', 'B.Tech', 'M.A', 'M.Sc', 'M.Com', 'M.Tech', 'MBA', 'MCA', 'MBBS', 'PhD', 'Other'];
export const MARITAL = [
  { label: 'Never married', value: 'Nevermarried' },
  { label: 'Divorced', value: 'Divorced' },
  { label: 'Widowed', value: 'Widowed' },
  { label: 'Awaiting divorce', value: 'AwaitingDivorce' }
];
export const EMPLOYMENT = [
  { label: 'Private', value: 'private' },
  { label: 'Public', value: 'public' },
  { label: 'Government', value: 'govt' },
  { label: 'Business', value: 'business' },
  { label: 'Self employed', value: 'self-employed' }
];

export function maritalLabel(value) {
  return MARITAL.find((item) => item.value === value)?.label || value || '';
}

export function ageFromDob(dob, today = new Date()) {
  if (!dob) return null;
  const match = String(dob).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  let age = today.getFullYear() - year;
  const monthGap = today.getMonth() - month;
  if (monthGap < 0 || (monthGap === 0 && today.getDate() < day)) age -= 1;
  return age;
}

export function maxDobFor18(today = new Date()) {
  const year = today.getFullYear() - 18;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fullName(profile) {
  return [profile?.firstName, profile?.lastName || profile?.surname].filter(Boolean).join(' ');
}
