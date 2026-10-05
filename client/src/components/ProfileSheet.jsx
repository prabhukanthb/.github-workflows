import React, { useRef, useState } from 'react';
import { incomeToLacsInput, mainPhotoUrl } from '../profileFields';
import { BRAND, ageFromDob, fullName, maritalLabel } from '../siteConfig';

const CONTACT_LINE = 'Contact B. John Ratnam 9440545049';

function joinParts(parts) {
  const values = [];
  for (const part of parts) {
    const text = String(part || '').trim();
    if (!text || values.includes(text)) continue;
    values.push(text);
  }
  return values.join(' · ');
}

function addressText(address) {
  if (!address) return '';
  const place = [address.pinCode, address.streetName, address.area, address.city, address.district]
    .map((part) => String(part || '').trim())
    .filter(Boolean);
  if (!place.length) return '';
  return [...place, address.state, address.country]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(', ');
}

function dobText(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return '';
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function heightText(profile) {
  if (profile.heightFeet == null || profile.heightFeet === '') return '';
  return `${profile.heightFeet}.${profile.heightInches || 0}`;
}

function Row({ label, value }) {
  return (
    <div className="sheet-row">
      <span>{label}</span>
      <div>{value || '—'}</div>
    </div>
  );
}

export default function ProfileSheet({ profile, onClose, allowDownload = false }) {
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!profile) return null;
  const name = fullName(profile);
  const photo = mainPhotoUrl(profile.photos);
  const age = ageFromDob(profile.dateOfBirth);
  const income = incomeToLacsInput(profile.income);

  const download = async () => {
    setBusy(true);
    setError('');
    try {
      const { default: html2canvas } = await import('html2canvas');
      const cardWidth = 920;
      const photoWidth = Math.round(cardWidth * 0.5);
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F7F4EC',
        windowWidth: 1280,
        onclone: (doc) => {
          const card = doc.querySelector('.sheet-card');
          if (!card) return;
          card.style.width = `${cardWidth}px`;
          card.style.maxWidth = `${cardWidth}px`;
          const body = card.querySelector('.sheet-body');
          const copy = card.querySelector('.sheet-copy');
          const photo = card.querySelector('.sheet-photo');
          const img = photo?.querySelector('img');
          if (body) {
            body.style.display = 'flex';
            body.style.flexDirection = 'row';
            body.style.alignItems = 'stretch';
            body.style.gap = '0';
            body.style.padding = '0';
            body.style.width = '100%';
          }
          if (copy) {
            copy.style.flex = '1 1 auto';
            copy.style.width = `${cardWidth - photoWidth}px`;
            copy.style.maxWidth = `${cardWidth - photoWidth}px`;
            copy.style.minWidth = '0';
          }
          if (photo) {
            photo.style.flex = `0 0 ${photoWidth}px`;
            photo.style.width = `${photoWidth}px`;
            photo.style.minWidth = `${photoWidth}px`;
            photo.style.maxWidth = `${photoWidth}px`;
            photo.style.boxSizing = 'border-box';
          }
          if (img) {
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.maxHeight = 'none';
            img.style.objectFit = 'contain';
            img.style.display = 'block';
          }
        }
      });
      const link = document.createElement('a');
      link.download = `${BRAND.replace(/\s+/g, '-')}-${profile.profileId || 'profile'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      setError('Could not download the profile. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div className="sheet-dialog" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={name}>
        <div className="actions" style={{ marginBottom: 12 }}>
          {allowDownload && (
            <button type="button" className="btn-maroon" onClick={download} disabled={busy}>
              {busy ? 'Preparing…' : 'Download profile'}
            </button>
          )}
          <button type="button" className="btn-ghost btn-close" onClick={onClose}>Close</button>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="sheet-card" ref={cardRef}>
          <div className="sheet-watermark" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, row) => (
              <div key={row}>
                {Array.from({ length: 4 }).map((__, col) => (
                  <span key={col}>{BRAND}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="sheet-inner">
            <header className="sheet-head">
              <div>
                <div className="sheet-kicker">Mala community</div>
                <div className="sheet-brand">{BRAND}</div>
              </div>
              <div className="sheet-id">
                <span>Profile ID</span>
                <strong>{profile.profileId || '—'}</strong>
              </div>
            </header>
            <div className="sheet-body">
              <div className="sheet-copy">
                <h2>{name || 'Member'}</h2>
                <Row label="Gender" value={profile.gender === 'female' ? 'Bride' : profile.gender === 'male' ? 'Groom' : ''} />
                <Row label="Date of birth" value={dobText(profile.dateOfBirth)} />
                <Row label="Age" value={age ? `${age} years` : ''} />
                <Row label="Height" value={heightText(profile)} />
                <Row label="Marital status" value={maritalLabel(profile.maritalStatus)} />
                <Row label="Sub-community" value={profile.religion} />
                <Row label="Caste" value="Mala" />
                <Row label="Mother tongue" value={profile.motherTongue} />
                <Row label="Education" value={joinParts([profile.highestEducation, profile.fieldOfStudy, profile.college])} />
                <Row label="Work" value={joinParts([profile.occupation, profile.jobTitle, profile.companyName])} />
                <Row label="Income" value={income ? `${income} lacs` : ''} />
                <Row label="Current address" value={addressText(profile.currentAddress)} />
                <Row label="Present address" value={addressText(profile.presentAddress)} />
                <Row label="Father" value={joinParts([profile.fatherName, profile.fatherOccupation, profile.fatherNativePlace])} />
                <Row label="Mother" value={joinParts([profile.motherName, profile.motherOccupation, profile.motherNativePlace])} />
                {profile.aboutMe && <p className="sheet-note"><strong>About me. </strong>{profile.aboutMe}</p>}
                {profile.partnerRequirement && <p className="sheet-note"><strong>Partner requirement. </strong>{profile.partnerRequirement}</p>}
              </div>
              <div className="sheet-photo">
                {photo ? <img src={photo} alt="" crossOrigin="anonymous" /> : <div>{(name || 'T').slice(0, 1)}</div>}
              </div>
            </div>
            <footer className="sheet-foot">{CONTACT_LINE}</footer>
          </div>
        </div>
      </div>
    </div>
  );
}
