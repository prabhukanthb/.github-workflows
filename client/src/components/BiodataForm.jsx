import React from 'react';
import { EDUCATION, EMPLOYMENT, MARITAL, MOTHER_TONGUES, RELIGIONS } from '../siteConfig';

export function profileToForm(profile = {}, user = {}) {
  return {
    firstName: user.firstName || profile.firstName || '',
    surname: user.surname || profile.surname || '',
    email: user.email || profile.email || '',
    phone: user.phone || profile.phone || '',
    password: '',
    gender: profile.gender || '',
    dateOfBirth: profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : '',
    heightFeet: profile.heightFeet ?? 5,
    heightInches: profile.heightInches ?? 4,
    religion: profile.religion || 'Hindu',
    motherTongue: profile.motherTongue || 'Telugu',
    maritalStatus: profile.maritalStatus || 'Nevermarried',
    highestEducation: profile.highestEducation || '',
    fieldOfStudy: profile.fieldOfStudy || '',
    occupation: profile.occupation || '',
    employmentType: profile.employmentType || 'private',
    companyName: profile.companyName || '',
    income: profile.income ?? '',
    jobLocation: profile.jobLocation || '',
    currentPinCode: profile.currentAddress?.pinCode || '',
    currentStreetName: profile.currentAddress?.streetName || '',
    currentCity: profile.currentAddress?.city || '',
    currentDistrict: profile.currentAddress?.district || '',
    currentState: profile.currentAddress?.state || 'Andhra Pradesh',
    currentCountry: profile.currentAddress?.country || 'India',
    presentPinCode: profile.presentAddress?.pinCode || '',
    presentStreetName: profile.presentAddress?.streetName || '',
    presentCity: profile.presentAddress?.city || '',
    presentDistrict: profile.presentAddress?.district || '',
    presentState: profile.presentAddress?.state || 'Andhra Pradesh',
    presentCountry: profile.presentAddress?.country || 'India',
    fatherName: profile.fatherName || '',
    fatherOccupation: profile.fatherOccupation || '',
    motherName: profile.motherName || '',
    motherOccupation: profile.motherOccupation || '',
    aboutMe: profile.aboutMe || '',
    partnerRequirement: profile.partnerRequirement || '',
    photoUrl: profile.photos?.[0]?.url || ''
  };
}

function AddressFields({ title, prefix, form, setForm }) {
  const set = (name) => (event) => setForm({ ...form, [name]: event.target.value });
  const pin = `${prefix}PinCode`;
  return (
    <div className="wide address-block">
      <h3 className="form-section">{title}</h3>
      <div className="address-fields">
        <div>
          <label>PIN code</label>
          <input value={form[pin] || ''} inputMode="numeric" onChange={(event) => setForm({ ...form, [pin]: event.target.value.replace(/\D/g, '').slice(0, 6) })} />
        </div>
        <div>
          <label>Street name</label>
          <input value={form[`${prefix}StreetName`] || ''} onChange={set(`${prefix}StreetName`)} />
        </div>
        <div>
          <label>City</label>
          <input value={form[`${prefix}City`] || ''} onChange={set(`${prefix}City`)} required={prefix === 'current'} />
        </div>
        <div>
          <label>District</label>
          <input value={form[`${prefix}District`] || ''} onChange={set(`${prefix}District`)} />
        </div>
        <div>
          <label>State</label>
          <input value={form[`${prefix}State`] || ''} onChange={set(`${prefix}State`)} />
        </div>
        <div>
          <label>Country</label>
          <input value={form[`${prefix}Country`] || ''} onChange={set(`${prefix}Country`)} />
        </div>
      </div>
    </div>
  );
}

export default function BiodataForm({ form, setForm, includeAccount = false }) {
  const set = (name) => (event) => setForm({ ...form, [name]: event.target.value });

  return (
    <div className="form-grid">
      {includeAccount && (
        <>
          <div>
            <label>First name</label>
            <input value={form.firstName} onChange={set('firstName')} required />
          </div>
          <div>
            <label>Surname</label>
            <input value={form.surname} onChange={set('surname')} required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} required />
          </div>
        </>
      )}
      <div>
        <label>Looking to introduce</label>
        <select value={form.gender} onChange={set('gender')} required>
          <option value="">Select</option>
          <option value="female">Bride</option>
          <option value="male">Groom</option>
        </select>
      </div>
      <div>
        <label>Date of birth</label>
        <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required />
      </div>
      <div>
        <label>Height (feet)</label>
        <input type="number" min="4" max="7" value={form.heightFeet} onChange={set('heightFeet')} />
      </div>
      <div>
        <label>Height (inches)</label>
        <input type="number" min="0" max="11" value={form.heightInches} onChange={set('heightInches')} />
      </div>
      <div>
        <label>Sub-community</label>
        <select value={form.religion} onChange={set('religion')}>
          {RELIGIONS.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div>
        <label>Mother tongue</label>
        <select value={form.motherTongue} onChange={set('motherTongue')}>
          {MOTHER_TONGUES.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div>
        <label>Marital status</label>
        <select value={form.maritalStatus} onChange={set('maritalStatus')}>
          {MARITAL.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>
      <div>
        <label>Education</label>
        <select value={form.highestEducation} onChange={set('highestEducation')} required>
          <option value="">Select</option>
          {EDUCATION.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div>
        <label>Field of study</label>
        <input value={form.fieldOfStudy} onChange={set('fieldOfStudy')} />
      </div>
      <div>
        <label>Occupation</label>
        <input value={form.occupation} onChange={set('occupation')} required />
      </div>
      <div>
        <label>Employment</label>
        <select value={form.employmentType} onChange={set('employmentType')}>
          {EMPLOYMENT.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>
      <div>
        <label>Workplace</label>
        <input value={form.companyName} onChange={set('companyName')} />
      </div>
      <div>
        <label>Annual income (INR)</label>
        <input type="number" min="0" value={form.income} onChange={set('income')} />
      </div>
      <div>
        <label>Work location</label>
        <input value={form.jobLocation} onChange={set('jobLocation')} />
      </div>
      <AddressFields title="Current address" prefix="current" form={form} setForm={setForm} />
      <AddressFields title="Present address" prefix="present" form={form} setForm={setForm} />
      <div>
        <label>Father’s name</label>
        <input value={form.fatherName} onChange={set('fatherName')} />
      </div>
      <div>
        <label>Father’s occupation</label>
        <input value={form.fatherOccupation} onChange={set('fatherOccupation')} />
      </div>
      <div>
        <label>Mother’s name</label>
        <input value={form.motherName} onChange={set('motherName')} />
      </div>
      <div>
        <label>Mother’s occupation</label>
        <input value={form.motherOccupation} onChange={set('motherOccupation')} />
      </div>
      <div className="wide">
        <label>About the candidate</label>
        <textarea value={form.aboutMe} onChange={set('aboutMe')} required />
      </div>
      <div className="wide">
        <label>Partner requirement</label>
        <textarea value={form.partnerRequirement} onChange={set('partnerRequirement')} />
      </div>
      <div className="wide">
        <label>Photo URL (optional)</label>
        <input value={form.photoUrl} onChange={set('photoUrl')} placeholder="https://" />
      </div>
    </div>
  );
}
