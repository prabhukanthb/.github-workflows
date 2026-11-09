import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { HEIGHT_OPTIONS, SUB_CASTES, heightToValue, incomeToLacsInput, lookupIndianPincode, normalizePhotos } from '../profileFields';
import { EDUCATION, EMPLOYMENT, MARITAL, MOTHER_TONGUES, RELIGIONS, SIBLINGS, ageFromDob, communityLabel, maxDobFor18 } from '../siteConfig';

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
    ...splitBirthTime(profile.timeOfBirth),
    placeOfBirth: profile.placeOfBirth || '',
    heightFeet: profile.heightFeet ?? 5,
    heightInches: profile.heightInches ?? 4,
    height: heightToValue(profile.heightFeet ?? 5, profile.heightInches ?? 4),
    religion: communityLabel(profile.religion) || 'Hindu',
    caste: 'Mala',
    subCaste: profile.subCaste || 'SC',
    siblingsCount: SIBLINGS.includes(profile.siblingsCount) ? profile.siblingsCount : '',
    aboutSiblings: profile.aboutSiblings || '',
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
    currentArea: profile.currentAddress?.area || '',
    currentCity: profile.currentAddress?.city || '',
    currentDistrict: profile.currentAddress?.district || '',
    currentState: profile.currentAddress?.state || 'Andhra Pradesh',
    currentCountry: profile.currentAddress?.country || 'India',
    fatherName: profile.fatherName || '',
    fatherOccupation: profile.fatherOccupation || '',
    fatherNativePlace: profile.fatherNativePlace || '',
    motherName: profile.motherName || '',
    motherOccupation: profile.motherOccupation || '',
    motherNativePlace: profile.motherNativePlace || '',
    aboutMe: profile.aboutMe || '',
    partnerRequirement: profile.partnerRequirement || '',
    photos: normalizePhotos(profile.photos)
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
        [`${prefix}Area`]: found.area || draft[`${prefix}Area`],
        [`${prefix}City`]: found.city || draft[`${prefix}City`],
        [`${prefix}District`]: found.district || draft[`${prefix}District`],
        [`${prefix}State`]: found.state || draft[`${prefix}State`],
        [`${prefix}Country`]: found.country || draft[`${prefix}Country`]
      });
      setPinNote('Area, city, district, state and country filled from the PIN.');
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
          <label>Area</label>
          <input value={form[`${prefix}Area`] || ''} onChange={set(`${prefix}Area`)} />
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

const BIRTH_HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'));
const BIRTH_MINUTES = Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0'));

function splitBirthTime(value) {
  const match = String(value || '').match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return {
    birthHour: match ? match[1] : '',
    birthMinute: match ? match[2] : '',
    timeOfBirth: match ? `${match[1]}:${match[2]}` : ''
  };
}

async function fileToDataUrl(file, max = 1400) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

export default function BiodataForm({ form, setForm, includeAccount = false, includeName = false, includePhone = false }) {
  const { token } = useAuth();
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [slide, setSlide] = useState(0);
  const set = (name) => (event) => setForm({ ...form, [name]: event.target.value });
  const setBirthPart = (part) => (event) => {
    const birthHour = part === 'hour' ? event.target.value : (form.birthHour || '');
    const birthMinute = part === 'minute' ? event.target.value : (form.birthMinute || '');
    const timeOfBirth = birthHour !== '' && birthMinute !== '' ? `${birthHour}:${birthMinute}` : '';
    setForm({ ...form, birthHour, birthMinute, timeOfBirth });
  };
  const photos = normalizePhotos(form.photos);
  const slideIndex = photos.length ? Math.min(slide, photos.length - 1) : 0;

  const uploadPhoto = async (event) => {
    const files = [...(event.target.files || [])].slice(0, 3 - photos.length);
    event.target.value = '';
    if (!files.length) return;
    setPhotoBusy(true);
    setPhotoError('');
    try {
      let next = photos;
      for (const file of files) {
        const dataUrl = await fileToDataUrl(file);
        const data = await api.uploadPhoto(dataUrl, token);
        next = normalizePhotos([...next, { url: data.url, isPrimary: next.length === 0 }]);
      }
      setForm({ ...form, photos: next });
      setSlide(Math.max(0, next.length - 1));
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setPhotoBusy(false);
    }
  };

  const chooseMain = (index) => {
    setForm({
      ...form,
      photos: photos.map((photo, photoIndex) => ({ ...photo, isPrimary: photoIndex === index }))
    });
  };

  const removePhoto = (index) => {
    const next = normalizePhotos(photos.filter((_, photoIndex) => photoIndex !== index));
    setForm({ ...form, photos: next });
    setSlide(Math.max(0, Math.min(slideIndex, next.length - 1)));
  };

  return (
    <div className="form-grid">
      {(includeAccount || includeName) && (
        <>
          <div>
            <label>Full Name</label>
            <input value={form.firstName} onChange={set('firstName')} required />
          </div>
          <div>
            <label>Surname</label>
            <input value={form.surname} onChange={set('surname')} required />
          </div>
        </>
      )}
      {includeAccount && (
        <>
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
      {includePhone && !includeAccount && (
        <div>
          <label>Mobile number</label>
          <input value={form.phone || ''} inputMode="numeric" onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} required />
        </div>
      )}
      {!includeAccount && (
        <div>
          <label>Alternate mobile</label>
          <input value={form.alternativePhone || ''} inputMode="numeric" onChange={(e) => setForm({ ...form, alternativePhone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
        </div>
      )}
      <h3 className="form-section wide">Basic Details</h3>
      <div>
        <label>Looking to introduce</label>
        <select value={form.gender} onChange={set('gender')} required>
          <option value="">Select</option>
          <option value="female">Girl</option>
          <option value="male">Boy</option>
        </select>
      </div>
      <div className="wide birth-row">
        <div>
          <label>Date of birth</label>
          <input type="date" max={maxDobFor18()} value={form.dateOfBirth} onChange={set('dateOfBirth')} required />
          {form.dateOfBirth && (
            <p className="pin-note">
              {ageFromDob(form.dateOfBirth) >= 18 ? `Age ${ageFromDob(form.dateOfBirth)}` : 'The candidate must be 18 or older.'}
            </p>
          )}
        </div>
        <div>
          <label>Time of birth</label>
          <div className="birth-time">
            <div>
              <label htmlFor="birth-hour">Hours</label>
              <select id="birth-hour" value={form.birthHour || ''} onChange={setBirthPart('hour')}>
                <option value="">Hours</option>
                {BIRTH_HOURS.map((hour) => <option key={hour} value={hour}>{hour}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="birth-minute">Minutes</label>
              <select id="birth-minute" value={form.birthMinute || ''} onChange={setBirthPart('minute')}>
                <option value="">Minutes</option>
                {BIRTH_MINUTES.map((minute) => <option key={minute} value={minute}>{minute}</option>)}
              </select>
            </div>
          </div>
          {(form.birthHour || form.birthMinute) && !(form.birthHour && form.birthMinute) && (
            <p className="pin-note">Choose both hours and minutes.</p>
          )}
        </div>
        <div>
          <label>Place of birth</label>
          <input value={form.placeOfBirth || ''} onChange={set('placeOfBirth')} />
        </div>
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
      <h3 className="form-section wide">Religion & Family</h3>
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
        <label>Caste</label>
        <input value="Mala" readOnly disabled />
      </div>
      <div>
        <label>Sub caste</label>
        <select value={form.subCaste || 'SC'} onChange={set('subCaste')}>
          {SUB_CASTES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>
      <div>
        <label>Siblings</label>
        <select value={form.siblingsCount || ''} onChange={set('siblingsCount')}>
          <option value="">Select</option>
          {SIBLINGS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="wide">
        <label>About Siblings</label>
        <textarea value={form.aboutSiblings || ''} onChange={set('aboutSiblings')} maxLength={1000} />
      </div>
      <div>
        <label>Marital status</label>
        <select value={form.maritalStatus} onChange={set('maritalStatus')}>
          {MARITAL.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>
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
      <h3 className="form-section wide">Education & Professional</h3>
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
      <h3 className="form-section wide">About & Preferences</h3>
      <div className="wide">
        <label>About the candidate</label>
        <textarea value={form.aboutMe} onChange={set('aboutMe')} required />
      </div>
      <div className="wide">
        <label>Partner requirement</label>
        <textarea value={form.partnerRequirement} onChange={set('partnerRequirement')} />
      </div>
      <div className="wide">
        <label>Photos</label>
        <p className="pin-note">Add up to 3 photos. They appear as a carousel. Choose one as the main photo.</p>
        {photos.length > 0 && (
          <div className="photo-carousel">
            <button type="button" className="btn-ghost btn-close" onClick={() => setSlide((photos.length + slideIndex - 1) % photos.length)} aria-label="Previous photo">Previous</button>
            <figure>
              <img src={photos[slideIndex].url} alt="" />
              <figcaption>{photos[slideIndex].isPrimary ? 'Main photo' : `Photo ${slideIndex + 1} of ${photos.length}`}</figcaption>
              <div className="actions">
                {!photos[slideIndex].isPrimary && (
                  <button type="button" className="btn-maroon" onClick={() => chooseMain(slideIndex)}>Set as main</button>
                )}
                <button type="button" className="btn-gold" onClick={() => removePhoto(slideIndex)}>Remove</button>
              </div>
            </figure>
            <button type="button" className="btn-ghost btn-close" onClick={() => setSlide((slideIndex + 1) % photos.length)} aria-label="Next photo">Next</button>
          </div>
        )}
        {photos.length < 3 && (
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadPhoto} disabled={photoBusy} />
        )}
        {photoBusy && <p>Uploading to Cloudinary…</p>}
        {photoError && <p className="error">{photoError}</p>}
      </div>
    </div>
  );
}
