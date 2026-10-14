import test from 'node:test';
import assert from 'node:assert/strict';
import { fieldsFromBiodataImage, fieldsFromBiodataText } from './biodataScan.js';

test('a biodata image text fills the office form fields', () => {
  const text = `
Telugu Kalyanamala
Full Name: Meena Kumari
Surname: Bandi
Email: meena.bandi@example.com
Phone: 9000007788
Gender: Bride
Date of birth: 12/04/2000
Height: 5.4
Marital status: Never married
Sub-community: Hindu
Mother tongue: Telugu
Education: B.A · Education · A college in Andhra Pradesh
Work: Teacher · A local school
Income: 4.8 lacs
Current address: 520004, Benz Circle, Vijayawada, Andhra Pradesh, India
Father: Joseph · Retired · Vijayawada
Mother: Mary · Homemaker · Guntur
About me. I teach primary classes in Vijayawada.
Partner requirement. A respectful groom.
Contact B. John Ratnam 9440545049
office@newkalyanamala.org
`;
  const { fields, found } = fieldsFromBiodataText(text);
  assert.equal(fields.firstName, 'Meena Kumari');
  assert.equal(fields.surname, 'Bandi');
  assert.equal(fields.email, 'meena.bandi@example.com');
  assert.equal(fields.phone, '9000007788');
  assert.equal(fields.gender, 'female');
  assert.equal(fields.dateOfBirth, '2000-04-12');
  assert.equal(fields.height, '5.4');
  assert.equal(fields.heightFeet, 5);
  assert.equal(fields.heightInches, 4);
  assert.equal(fields.maritalStatus, 'Nevermarried');
  assert.equal(fields.religion, 'Hindu');
  assert.equal(fields.motherTongue, 'Telugu');
  assert.equal(fields.highestEducation, 'B.A');
  assert.equal(fields.fieldOfStudy, 'Education');
  assert.equal(fields.college, 'A college in Andhra Pradesh');
  assert.equal(fields.occupation, 'Teacher');
  assert.equal(fields.companyName, 'A local school');
  assert.equal(fields.income, '4.8');
  assert.equal(fields.currentPinCode, '520004');
  assert.equal(fields.currentStreetName, 'Benz Circle');
  assert.equal(fields.currentCity, 'Vijayawada');
  assert.equal(fields.currentState, 'Andhra Pradesh');
  assert.equal(fields.fatherName, 'Joseph');
  assert.equal(fields.motherNativePlace, 'Guntur');
  assert.match(fields.aboutMe, /primary classes/);
  assert.equal(found.includes('Full Name'), true);
  assert.equal(fields.email.includes('newkalyanamala'), false);
});

test('the office helpline is not used as the member phone', () => {
  const { fields } = fieldsFromBiodataText('Name: Ravi Teja\nContact B. John Ratnam 9440545049');
  assert.equal(fields.firstName, 'Ravi');
  assert.equal(fields.surname, 'Teja');
  assert.equal(fields.phone, undefined);
});

test('only a JPEG or PNG data URL is accepted', async () => {
  await assert.rejects(() => fieldsFromBiodataImage('data:text/plain;base64,aGVsbG8='), /JPEG or PNG/);
  await assert.rejects(() => fieldsFromBiodataImage(''), /JPEG or PNG/);
});

test('a label on its own line uses the next line as the value', () => {
  const { fields } = fieldsFromBiodataText('Date of birth\n31/05/2004\nHeight\n5 ft 6 in');
  assert.equal(fields.dateOfBirth, '2004-05-31');
  assert.equal(fields.height, '5.6');
  assert.equal(fields.heightFeet, 5);
  assert.equal(fields.heightInches, 6);
});
