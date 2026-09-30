import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { HEIGHT_OPTIONS, SUB_CASTES, heightToValue, incomeToLacsInput, lookupIndianPincode } from '../profileFields';
import { EDUCATION, EMPLOYMENT, MARITAL, MOTHER_TONGUES, RELIGIONS } from '../siteConfig';

export function profileToForm(profile = {}, user = {}) {
  return {
    firstName: user.firstName || profile.firstName || '',
    surname: user.surname || profile.surname || '',
    email: user.email || profile.email || '',
    phone: user.phone || profile.phone || '',
    alternativePhone: user.alternativePhone || profile.alternativePhone || '',
    password: '',
    gender: profile.gender || '',
    dateOfBirth: profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : '',
    heightFeet: profile.heightFeet ?? 5,
    heightInches: profile.heightInches ?? 4,
    height: heightToValue(profile.heightFeet ?? 5, profile.heightInches ?? 4),
    religion: profile.religion || 'Hindu',
    subCaste: profile.subCaste || 'SC',
    siblingsCount: profile.siblingsCount === 0 || profile.siblingsCount ? String(profile.siblingsCount) : '0',
    motherTongue: profile.motherTongue || 'Telugu',
    maritalStatus: profile.maritalStatus || 'Nevermarried',
    highestEducation: profile.highestEducation || '',
    fieldOfStudy: profile.fieldOfStudy || '',
    college: profile.college || '',
    occupation: profile.occupation || '',
    employmentType: profile.employmentType || 'private',
    companyName: profile.companyName || '',
    jobTitle: profile.jobTitle || '',
    income: incomeToLacsInput(profile.income),
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
    fatherNativePlace: profile.fatherNativePlace || '',
    motherName: profile.motherName || '',
    motherOccupation: profile.motherOccupation || '',
    motherNativePlace: profile.motherNativePlace || '',
    aboutMe: profile.aboutMe || '',
    partnerRequirement: profile.partnerRequirement || '',
    photoUrl: profile.photos?.[0]?.url || ''
  };
}

function AddressFields({ title, prefix, form, setForm }) {
  const set = (name) => (event) => setForm({ ...form, [name]: event.target.value });
  const pin = `${prefix}PinCode`;
  const [pinNote, setPinNote] = useState('');

  const onPin = async (event) => {
    const next = event.target.value.replace(/\D/g, '').slice(0, 6);
    const draft = { ...form, [pin]: next };
    setForm(draft);
    setPinNote('');
    if (!/^[0-9]{6}$/.test(next)) return;
    setPinNote('Looking up PIN…');
    try {
      const found = await lookupIndianPincode(next);
      if (!found) {
        setPinNote('PIN not found. Type the city and district.');
        return;
      }
      setForm({
        ...draft,
        [`${prefix}City`]: found.city || draft[`${prefix}City`],
        [`${prefix}District`]: found.district || draft[`${prefix}District`],
        [`${prefix}State`]: found.state || draft[`${prefix}State`],
        [`${prefix}Country`]: found.country || draft[`${prefix}Country`]
      });
      setPinNote('City, district, state and country filled from the PIN.');
    } catch {
      setPinNote('PIN lookup is unavailable. Type the city and district.');
    }
  };

  return (
    <div className="wide address-block">
      <h3 className="form-section">{title}</h3>
      <div className="address-fields">
        <div>
          <label>Pin code</label>
          <input value={form[pin] || ''} inputMode="numeric" onChange={onPin} />
          {pinNote && <p className="pin-note">{pinNote}</p>}
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

async function fileToDataUrl(file) {
  const bitmap = await createImageBitmap(file);
  const max = 1400;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

export default function BiodataForm({ form, setForm, includeAccount = false }) {
  const { token } = useAuth();
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const set = (name) => (event) => setForm({ ...form, [name]: event.target.value });

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPhotoBusy(true);
    setPhotoError('');
    try {
      const dataUrl = await fileToDataUrl(file);
      const data = await api.uploadPhoto(dataUrl, token);
      setForm({ ...form, photoUrl: data.url });
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setPhotoBusy(false);
    }
  };

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
          <div>
            <label>Alternate mobile</label>
            <input value={form.alternativePhone || ''} inputMode="numeric" onChange={(e) => setForm({ ...form, alternativePhone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={form.password || ''} onChange={set('password')} autoComplete="new-password" placeholder="Leave blank for the default password" />
          </div>
        </>
      )}
      {!includeAccount && (
        <div>
          <label>Alternate mobile</label>
          <input value={form.alternativePhone || ''} inputMode="numeric" onChange={(e) => setForm({ ...form, alternativePhone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
        </div>
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
        <label>Height</label>
        <select
          value={form.height || heightToValue(form.heightFeet, form.heightInches)}
          onChange={(event) => {
            const match = HEIGHT_OPTIONS.find((item) => item.value === event.target.value);
            setForm({
              ...form,
              height: event.target.value,
              heightFeet: match ? match.feet : form.heightFeet,
              heightInches: match ? match.inches : form.heightInches
            });
          }}
          required
        >
          <option value="">Select</option>
          {HEIGHT_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
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
        <label>Sub caste</label>
        <select value={form.subCaste || 'SC'} onChange={set('subCaste')}>
          {SUB_CASTES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>
      <div>
        <label>Siblings</label>
        <select value={form.siblingsCount ?? '0'} onChange={set('siblingsCount')}>
          {['0', '1', '2', '3'].map((item) => <option key={item} value={item}>{item}</option>)}
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
        <label>College</label>
        <input value={form.college || ''} onChange={set('college')} />
      </div>
      <div>
        <label>Occupation</label>
        <input value={form.occupation} onChange={set('occupation')} required />
      </div>
      <div>
        <label>Job title</label>
        <input value={form.jobTitle || ''} onChange={set('jobTitle')} />
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
        <label>Annual income (lacs)</label>
        <input type="number" min="0" step="0.1" value={form.income} onChange={set('income')} />
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
        <label>Father’s native place</label>
        <input value={form.fatherNativePlace || ''} onChange={set('fatherNativePlace')} />
      </div>
      <div>
        <label>Mother’s name</label>
        <input value={form.motherName} onChange={set('motherName')} />
      </div>
      <div>
        <label>Mother’s occupation</label>
        <input value={form.motherOccupation} onChange={set('motherOccupation')} />
      </div>
      <div>
        <label>Mother’s native place</label>
        <input value={form.motherNativePlace || ''} onChange={set('motherNativePlace')} />
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
        <label>Photo</label>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={photoBusy} />
        {photoBusy && <p>Uploading to Cloudinary…</p>}
        {photoError && <p className="error">{photoError}</p>}
        {form.photoUrl && <img className="photo-preview" src={form.photoUrl} alt="" />}
      </div>
    </div>
  );
}
