import React from 'react';
import { ageFromDob } from '../siteConfig';

export function missingRequiredProfileFields(form = {}) {
  const missing = [];
  if (String(form.firstName || '').trim().length < 2) missing.push({ key: 'firstName', label: 'Full Name of Bride or Groom' });
  if (String(form.surname || '').trim().length < 2) missing.push({ key: 'surname', label: 'Surname' });
  if (String(form.phone || '').replace(/\D/g, '').length !== 10) missing.push({ key: 'phone', label: 'Phone' });
  if (form.gender !== 'male' && form.gender !== 'female') missing.push({ key: 'gender', label: 'Looking to introduce' });
  const age = ageFromDob(form.dateOfBirth);
  if (!form.dateOfBirth || age == null) missing.push({ key: 'dateOfBirth', label: 'Date of birth' });
  else if (age < 18) missing.push({ key: 'dateOfBirth', label: 'Date of birth (18 or older)' });
  return missing;
}

export function stopIfProfileIncomplete(form, setMissing) {
  return (event) => {
    const missing = missingRequiredProfileFields(form);
    if (!missing.length) {
      setMissing([]);
      return;
    }
    event.preventDefault();
    setMissing(missing);
    document.getElementById(`field-${missing[0].key}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };
}

export function RequiredFieldsPopup({ missing, onClose }) {
  if (!missing?.length) return null;
  return (
    <div className="modal-back" role="presentation">
      <div className="modal access-notice" role="dialog" aria-modal="true" aria-labelledby="required-fields-title">
        <div className="body">
          <h2 id="required-fields-title">Fill these fields</h2>
          <p>The profile was not saved. These fields are missing:</p>
          <ul className="missing-fields">
            {missing.map((item) => <li key={`${item.key}-${item.label}`}>{item.label}</li>)}
          </ul>
          <div className="actions">
            <button type="button" className="btn-maroon" onClick={onClose}>OK</button>
          </div>
        </div>
      </div>
    </div>
  );
}
