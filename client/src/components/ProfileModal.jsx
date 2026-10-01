import React, { useState } from 'react';
import { ageFromDob, fullName, maritalLabel } from '../siteConfig';

function addressLine(address) {
  if (!address) return '';
  return [address.pinCode, address.streetName, address.area, address.city, address.district, address.state, address.country]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(', ');
}

export default function ProfileModal({ profile, onClose, onInterest }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  if (!profile) return null;
  const photo = profile.photos?.[0]?.url;
  const name = fullName(profile);

  const send = async () => {
    setBusy(true);
    setMessage('');
    try {
      const text = await onInterest(profile.id);
      setMessage(text);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div className="modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={name}>
        <div className="modal-photo">
          {photo ? <img src={photo} alt="" /> : <div className="avatar">{name.slice(0, 1)}</div>}
        </div>
        <div className="body">
          <div className="kicker">{profile.profileId}</div>
          <h2>{name}</h2>
          <div className="detail-list">
            <span>Age</span><div>{ageFromDob(profile.dateOfBirth)}</div>
            <span>Height</span><div>{profile.heightFeet} ft {profile.heightInches} in</div>
            <span>Caste</span><div>Mala</div>
            <span>Community</span><div>{profile.religion}</div>
            <span>Mother tongue</span><div>{profile.motherTongue}</div>
            <span>Marital status</span><div>{maritalLabel(profile.maritalStatus)}</div>
            <span>Education</span><div>{profile.highestEducation} · {profile.fieldOfStudy}</div>
            <span>Work</span><div>{profile.occupation}{profile.jobLocation ? ` · ${profile.jobLocation}` : ''}</div>
            <span>Current address</span><div>{addressLine(profile.currentAddress)}</div>
            <span>Present address</span><div>{addressLine(profile.presentAddress)}</div>
            <span>Family</span><div>{profile.fatherOccupation} / {profile.motherOccupation}</div>
          </div>
          <p>{profile.aboutMe}</p>
          <p><strong>Partner requirement. </strong>{profile.partnerRequirement}</p>
          <p className="notice">Phone and email stay with the Vijayawada office until both families agree.</p>
          {message && <div className="ok">{message}</div>}
          <div className="actions">
            <button type="button" className="btn-maroon" onClick={send} disabled={busy}>
              {busy ? 'Sending…' : 'Express interest'}
            </button>
            <button type="button" className="btn-ghost btn-close" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
