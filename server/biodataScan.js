import fs from 'fs';
import os from 'os';
import path from 'path';

const OFFICE_PHONES = new Set(['9440545049', '9241512415']);
const OFFICE_EMAIL = 'office@newkalyanamala.org';

const LINE_LABELS = [
  ['full name', 'firstNameExact'],
  ['candidate name', 'firstNameExact'],
  ['surname', 'surname'],
  ['last name', 'surname'],
  ['email', 'email'],
  ['e-mail', 'email'],
  ['alternate mobile', 'alternativePhone'],
  ['alternative mobile', 'alternativePhone'],
  ['alternative phone', 'alternativePhone'],
  ['date of birth', 'dateOfBirth'],
  ['dob', 'dateOfBirth'],
  ['looking to introduce', 'gender'],
  ['mother tongue', 'motherTongue'],
  ['marital status', 'maritalStatus'],
  ['sub-community', 'religion'],
  ['sub community', 'religion'],
  ['annual income', 'income'],
  ['current address', 'currentAddress'],
  ['present address', 'presentAddress'],
  ['partner requirement', 'partnerRequirement'],
  ['about the candidate', 'aboutMe'],
  ['about me', 'aboutMe'],
  ['work location', 'jobLocation'],
  ['workplace', 'companyName'],
  ['mobile', 'phone'],
  ['phone', 'phone'],
  ['gender', 'gender'],
  ['height', 'height'],
  ['community', 'religion'],
  ['religion', 'religion'],
  ['education', 'education'],
  ['occupation', 'occupation'],
  ['income', 'income'],
  ['father', 'father'],
  ['mother', 'mother'],
  ['siblings', 'siblings'],
  ['work', 'work'],
  ['name', 'firstName']
];

const STATES = [
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Maharashtra',
  'Delhi',
  'Odisha',
  'West Bengal'
];

const TONGUES = ['Telugu', 'Tamil', 'Kannada', 'Hindi', 'English'];

const EDUCATION_ALIASES = [
  ['mbbs', 'MBBS'],
  ['btech', 'B.Tech'],
  ['mtech', 'M.Tech'],
  ['bcom', 'B.Com'],
  ['mcom', 'M.Com'],
  ['bsc', 'B.Sc'],
  ['msc', 'M.Sc'],
  ['mba', 'MBA'],
  ['mca', 'MCA'],
  ['phd', 'PhD'],
  ['iti', 'ITI'],
  ['ba', 'B.A'],
  ['ma', 'M.A'],
  ['be', 'B.Tech'],
  ['10th', '10th Pass'],
  ['ssc', '10th Pass'],
  ['12th', '12th Pass'],
  ['intermediate', '12th Pass'],
  ['diploma', 'Diploma']
];

const FOUND_LABELS = {
  firstName: 'Full Name',
  surname: 'Surname',
  email: 'Email',
  phone: 'Phone',
  alternativePhone: 'Alternate mobile',
  gender: 'Looking to introduce',
  dateOfBirth: 'Date of birth',
  height: 'Height',
  maritalStatus: 'Marital status',
  religion: 'Sub-community',
  motherTongue: 'Mother tongue',
  highestEducation: 'Education',
  fieldOfStudy: 'Field of study',
  college: 'College',
  occupation: 'Work',
  companyName: 'Workplace',
  income: 'Income',
  jobLocation: 'Work location',
  currentCity: 'Current address',
  presentCity: 'Present address',
  fatherName: 'Father',
  motherName: 'Mother',
  aboutMe: 'About me',
  partnerRequirement: 'Partner requirement',
  siblingsCount: 'Siblings'
};

function cleanLine(line) {
  return String(line || '').replace(/\s+/g, ' ').trim();
}

function matchLabel(line) {
  const cleaned = cleanLine(line);
  if (!cleaned) return null;
  const lower = cleaned.toLowerCase();
  const bare = lower.replace(/[.:]+$/g, '').trim();
  for (const [label, key] of LINE_LABELS) {
    if (bare === label) return { key, rest: '' };
    if (lower.startsWith(label)) {
      const rest = cleaned.slice(label.length).replace(/^[\s:.\-–|]+/, '').trim();
      if (rest) return { key, rest };
    }
  }
  return null;
}

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

function phoneFrom(value) {
  const found = digits(value).match(/(\d{10})/);
  if (!found) return '';
  return OFFICE_PHONES.has(found[1]) ? '' : found[1];
}

function parseDate(value) {
  const text = String(value || '');
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = text.match(/(\d{1,2})[/. -](\d{1,2})[/. -](\d{4})/);
  if (!dmy) return '';
  const day = dmy[1].padStart(2, '0');
  const month = dmy[2].padStart(2, '0');
  if (Number(month) < 1 || Number(month) > 12 || Number(day) < 1 || Number(day) > 31) return '';
  return `${dmy[3]}-${month}-${day}`;
}

function parseHeight(value) {
  const text = String(value || '');
  const words = text.match(/(\d)\s*(?:ft|feet|')\s*(\d{1,2})/i);
  const dotted = text.match(/(\d)\.(\d{1,2})/);
  let feet;
  let inches;
  if (words) {
    feet = Number(words[1]);
    inches = Number(words[2]);
  } else if (dotted) {
    feet = Number(dotted[1]);
    inches = Number(dotted[2]);
  } else {
    return null;
  }
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  if (feet < 4 || feet > 7 || inches < 0 || inches > 11) return null;
  const height = feet === 7 && inches === 0 ? '6.12' : `${feet}.${inches}`;
  return {
    height,
    heightFeet: feet === 7 ? 7 : feet,
    heightInches: inches
  };
}

function parseIncome(value) {
  const text = String(value || '');
  const lacs = text.match(/(\d+(?:\.\d+)?)\s*(?:lac|lakh)/i);
  if (lacs) return String(Number(lacs[1]));
  const rupees = text.match(/(\d{5,8})/);
  if (rupees) {
    const rounded = Math.round((Number(rupees[1]) / 100000) * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }
  const plain = text.match(/(\d+(?:\.\d+)?)/);
  if (plain && Number(plain[1]) > 0 && Number(plain[1]) < 1000) return String(Number(plain[1]));
  return '';
}

function matchGender(value) {
  const lower = String(value || '').toLowerCase();
  if (/\b(bride|female|woman|girl)\b/.test(lower)) return 'female';
  if (/\b(groom|male|man|boy)\b/.test(lower)) return 'male';
  return '';
}

function matchReligion(value) {
  const lower = String(value || '').toLowerCase();
  if (lower.includes('ambedkar')) return 'Ambedkarist';
  if (lower.includes('christian')) return 'Christian';
  if (lower.includes('buddhist')) return 'Buddhist';
  if (lower.includes('hindu')) return 'Hindu';
  if (lower.includes('other')) return 'Other';
  return '';
}

function matchMarital(value) {
  const lower = String(value || '').toLowerCase();
  if (lower.includes('await')) return 'AwaitingDivorce';
  if (lower.includes('divorc')) return 'Divorced';
  if (lower.includes('widow')) return 'Widowed';
  if (lower.includes('never') || lower.includes('unmarried') || lower.includes('single')) return 'Nevermarried';
  return '';
}

function matchTongue(value) {
  const lower = String(value || '').toLowerCase();
  return TONGUES.find((tongue) => lower.includes(tongue.toLowerCase())) || '';
}

function matchEducation(value) {
  const tokens = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9.\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/\./g, ''))
    .filter(Boolean);
  for (const token of tokens) {
    const hit = EDUCATION_ALIASES.find(([alias]) => alias === token);
    if (hit) return hit[1];
  }
  return '';
}

function splitParts(value) {
  return String(value || '')
    .split(/\s*[·|]\s*|\s+-\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function usableName(value) {
  const cleaned = cleanLine(value).replace(/^[^A-Za-z]+/, '');
  if (cleaned.length < 2) return '';
  if (/telugu kalyanamala|mala community|profile id|contact b\.?\s*john/i.test(cleaned)) return '';
  return cleaned;
}

function applyAddress(fields, value, prefix) {
  const text = cleanLine(value);
  if (!text) return;
  const pin = (text.match(/\b(\d{6})\b/) || [])[1] || '';
  const state = STATES.find((item) => text.toLowerCase().includes(item.toLowerCase())) || '';
  const country = /india/i.test(text) ? 'India' : '';
  const parts = text.split(',').map((part) => part.trim()).filter(Boolean).filter((part) => {
    if (pin && part.includes(pin) && digits(part) === pin) return false;
    if (state && part.toLowerCase() === state.toLowerCase()) return false;
    if (/^india$/i.test(part)) return false;
    return true;
  });
  const city = parts.length ? parts[parts.length - 1] : '';
  const street = parts.length > 1 ? parts.slice(0, -1).join(', ') : '';
  if (pin) fields[`${prefix}PinCode`] = pin;
  if (street) fields[`${prefix}StreetName`] = street;
  if (city) fields[`${prefix}City`] = city.replace(/\b\d{6}\b/, '').trim();
  if (state) fields[`${prefix}State`] = state;
  if (country || pin) fields[`${prefix}Country`] = country || 'India';
}

function assign(fields, key, rest) {
  if (key === 'firstNameExact') {
    const name = usableName(rest);
    if (name) fields.firstName = name;
    return;
  }
  if (key === 'firstName') {
    const name = usableName(rest);
    if (!name) return;
    if (fields.surname) {
      fields.firstName = name;
      return;
    }
    const parts = name.split(' ');
    if (parts.length >= 2) {
      fields.surname = parts.pop();
      fields.firstName = parts.join(' ');
    } else {
      fields.firstName = name;
    }
    return;
  }
  if (key === 'surname') {
    const name = usableName(rest);
    if (name) fields.surname = name;
    return;
  }
  if (key === 'email') {
    const email = (rest.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || '';
    if (email && email.toLowerCase() !== OFFICE_EMAIL) fields.email = email.toLowerCase();
    return;
  }
  if (key === 'phone' || key === 'alternativePhone') {
    const phone = phoneFrom(rest);
    if (phone) fields[key] = phone;
    return;
  }
  if (key === 'dateOfBirth') {
    const date = parseDate(rest);
    if (date) fields.dateOfBirth = date;
    return;
  }
  if (key === 'height') {
    const height = parseHeight(rest);
    if (height) Object.assign(fields, height);
    return;
  }
  if (key === 'gender') {
    const gender = matchGender(rest);
    if (gender) fields.gender = gender;
    return;
  }
  if (key === 'religion') {
    const religion = matchReligion(rest);
    if (religion) fields.religion = religion;
    return;
  }
  if (key === 'maritalStatus') {
    const marital = matchMarital(rest);
    if (marital) fields.maritalStatus = marital;
    return;
  }
  if (key === 'motherTongue') {
    const tongue = matchTongue(rest);
    if (tongue) fields.motherTongue = tongue;
    return;
  }
  if (key === 'education') {
    const education = matchEducation(rest);
    const parts = splitParts(rest);
    if (education) fields.highestEducation = education;
    if (parts.length >= 3) {
      fields.fieldOfStudy = parts[1];
      fields.college = parts.slice(2).join(' · ');
    } else if (parts[1] && !/^education$/i.test(parts[1])) {
      fields.fieldOfStudy = parts[1];
    } else if (!education && parts[0]) {
      fields.fieldOfStudy = parts[0];
    }
    return;
  }
  if (key === 'work' || key === 'occupation') {
    const parts = splitParts(rest);
    if (parts[0]) fields.occupation = parts[0];
    if (parts[1]) fields.companyName = parts[1];
    return;
  }
  if (key === 'companyName' || key === 'jobLocation') {
    const value = cleanLine(rest);
    if (value) fields[key] = value;
    return;
  }
  if (key === 'income') {
    const income = parseIncome(rest);
    if (income) fields.income = income;
    return;
  }
  if (key === 'currentAddress' || key === 'presentAddress') {
    applyAddress(fields, rest, key === 'currentAddress' ? 'current' : 'present');
    return;
  }
  if (key === 'father' || key === 'mother') {
    const parts = splitParts(rest);
    if (!parts[0] || /telugu kalyanamala/i.test(parts[0])) return;
    fields[`${key}Name`] = parts[0];
    if (parts[1]) fields[`${key}Occupation`] = parts[1];
    if (parts[2]) fields[`${key}NativePlace`] = parts[2];
    return;
  }
  if (key === 'aboutMe' || key === 'partnerRequirement') {
    const value = cleanLine(rest);
    if (value && !/telugu kalyanamala/i.test(value)) fields[key] = value.slice(0, 2000);
    return;
  }
  if (key === 'siblings') {
    const count = Number((rest.match(/[0-3]/) || [])[0]);
    if (Number.isInteger(count)) fields.siblingsCount = String(count);
  }
}

export function fieldsFromBiodataText(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean);
  const fields = {};
  for (let index = 0; index < lines.length; index += 1) {
    const hit = matchLabel(lines[index]);
    if (!hit) continue;
    let rest = hit.rest;
    if (!rest && lines[index + 1] && !matchLabel(lines[index + 1])) {
      rest = lines[index + 1];
      index += 1;
    }
    if (rest) assign(fields, hit.key, rest);
  }
  if (!fields.email) {
    const email = (String(text || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || '';
    if (email && email.toLowerCase() !== OFFICE_EMAIL) fields.email = email.toLowerCase();
  }
  if (!fields.phone) {
    const phones = [...String(text || '').matchAll(/(?<!\d)(\d{10})(?!\d)/g)].map((item) => item[1]);
    const phone = phones.find((item) => !OFFICE_PHONES.has(item));
    if (phone) fields.phone = phone;
  }
  const found = [];
  for (const [key, label] of Object.entries(FOUND_LABELS)) {
    if (fields[key]) found.push(label);
  }
  return { fields, found };
}

function imageBuffer(dataUrl) {
  const match = String(dataUrl || '').match(/^data:image\/(png|jpeg|jpg);base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) {
    const error = new Error('Upload a JPEG or PNG biodata image.');
    error.status = 400;
    throw error;
  }
  const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
  if (!buffer.length || buffer.length > 8 * 1024 * 1024) {
    const error = new Error('That image is empty or larger than 8 MB.');
    error.status = 400;
    throw error;
  }
  return buffer;
}

let workerPromise;

async function ocrWorker() {
  if (!workerPromise) {
    workerPromise = import('tesseract.js')
      .then(async ({ createWorker }) => {
        const cachePath = path.join(os.tmpdir(), 'telugu-kalyanamala-ocr');
        fs.mkdirSync(cachePath, { recursive: true });
        const worker = await createWorker('eng', undefined, { cachePath });
        await worker.setParameters({
          tessedit_pageseg_mode: '6',
          user_defined_dpi: '300',
          preserve_interword_spaces: '1'
        });
        return worker;
      })
      .catch((err) => {
        workerPromise = null;
        throw err;
      });
  }
  return workerPromise;
}

export async function fieldsFromBiodataImage(dataUrl) {
  const buffer = imageBuffer(dataUrl);
  const worker = await ocrWorker();
  const result = await worker.recognize(buffer);
  return fieldsFromBiodataText(result?.data?.text || '');
}
