import { ageFromDob } from './match.js';

export function missingProfileFields({ firstName = '', surname = '', phone = '', gender = '', dateOfBirth = '' } = {}) {
  const missing = [];
  if (String(firstName).trim().length < 2) missing.push('Full Name of Bride or Groom');
  if (String(surname).trim().length < 2) missing.push('Surname');
  if (String(phone).replace(/\D/g, '').length !== 10) missing.push('Phone');
  if (gender !== 'male' && gender !== 'female') missing.push('Looking to introduce');
  const age = ageFromDob(dateOfBirth);
  if (!dateOfBirth || age == null) missing.push('Date of birth');
  else if (age < 18) missing.push('Date of birth (18 or older)');
  return missing;
}
