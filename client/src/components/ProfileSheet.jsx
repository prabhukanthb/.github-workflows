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

const SHEET = {
  cream: '#F7F4EC',
  deep: '#5E6B52',
  blush: '#E89EB8',
  scarlet: '#C42336',
  ink: '#2C3328',
  muted: '#5C6A50',
  line: '#E4E0D2'
};

function applyDownloadStyles(card) {
  const cardWidth = 920;
  const photoWidth = Math.round(cardWidth * 0.5);
  card.style.cssText = [
    'position:relative',
    'overflow:hidden',
    `background:${SHEET.cream}`,
    `border:3px solid ${SHEET.blush}`,
    `color:${SHEET.ink}`,
    `width:${cardWidth}px`,
    'max-width:none',
    'font-family:Georgia, Times New Roman, serif'
  ].join(';');
  const watermark = card.querySelector('.sheet-watermark');
  if (watermark) watermark.remove();
  const inner = card.querySelector('.sheet-inner');
  if (inner) inner.style.cssText = 'position:relative;z-index:1;background:transparent;';
  const head = card.querySelector('.sheet-head');
  if (head) {
    head.style.cssText = `display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 22px;background:${SHEET.deep};color:${SHEET.cream};`;
  }
  const kicker = card.querySelector('.sheet-kicker');
  if (kicker) kicker.style.cssText = `letter-spacing:1.6px;text-transform:uppercase;font-size:12px;color:${SHEET.blush};font-weight:700;`;
  const brand = card.querySelector('.sheet-brand');
  if (brand) brand.style.cssText = 'font-family:Georgia, Times New Roman, serif;font-size:28px;color:#F7F4EC;';
  const id = card.querySelector('.sheet-id');
  if (id) id.style.cssText = `background:#fff;color:${SHEET.scarlet};border-radius:8px;padding:8px 14px;text-align:right;`;
  const idLabel = card.querySelector('.sheet-id span');
  if (idLabel) idLabel.style.cssText = 'display:block;font-size:12px;letter-spacing:1px;text-transform:uppercase;';
  const idValue = card.querySelector('.sheet-id strong');
  if (idValue) idValue.style.cssText = `font-family:Georgia, Times New Roman, serif;font-size:22px;color:${SHEET.scarlet};`;
  const body = card.querySelector('.sheet-body');
  if (body) {
    body.style.cssText = 'display:flex;flex-direction:row;align-items:flex-start;gap:0;padding:0;width:100%;background:transparent;';
  }
  const copy = card.querySelector('.sheet-copy');
  if (copy) {
    copy.style.cssText = `flex:1 1 auto;width:${cardWidth - photoWidth}px;max-width:${cardWidth - photoWidth}px;min-width:0;padding:18px 16px 12px 22px;box-sizing:border-box;`;
  }
  const title = card.querySelector('.sheet-copy h2');
  if (title) title.style.cssText = `margin:0 0 8px;font-family:Georgia, Times New Roman, serif;color:${SHEET.scarlet};font-size:32px;`;
  card.querySelectorAll('.sheet-row').forEach((row) => {
    row.style.cssText = `display:grid;grid-template-columns:140px minmax(0,1fr);gap:8px;padding:4px 0;border-bottom:1px solid ${SHEET.line};font-size:15px;font-family:Segoe UI, Arial, sans-serif;`;
    const label = row.querySelector('span');
    if (label) label.style.cssText = `color:${SHEET.muted};`;
  });
  card.querySelectorAll('.sheet-note').forEach((note) => {
    note.style.cssText = 'margin:12px 0 0;font-family:Segoe UI, Arial, sans-serif;font-size:15px;line-height:1.45;';
  });
  const photo = card.querySelector('.sheet-photo');
  if (photo) {
    photo.style.cssText = [
      `flex:0 0 ${photoWidth}px`,
      `width:${photoWidth}px`,
      `min-width:${photoWidth}px`,
      `max-width:${photoWidth}px`,
      'height:auto',
      'min-height:0',
      'align-self:flex-start',
      'background:transparent',
      'box-sizing:border-box',
      `border:4px solid ${SHEET.blush}`,
      'overflow:visible'
    ].join(';');
  }
  const img = photo?.querySelector('img');
  if (img) {
    img.style.cssText = 'width:100%;height:auto;max-height:none;object-fit:contain;object-position:center top;display:block;';
  }
  const foot = card.querySelector('.sheet-foot');
  if (foot) {
    foot.style.cssText = `padding:12px 22px;text-align:center;font-weight:700;background:${SHEET.deep};color:${SHEET.cream};font-family:Segoe UI, Arial, sans-serif;`;
  }
}

function paintWatermark(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = SHEET.deep;
  ctx.font = '700 42px Georgia, Times New Roman, serif';
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-18 * Math.PI / 180);
  const label = BRAND;
  const stepX = 460;
  const stepY = 150;
  for (let y = -canvas.height; y < canvas.height; y += stepY) {
    for (let x = -canvas.width; x < canvas.width; x += stepX) {
      ctx.fillText(label, x, y);
    }
  }
  ctx.restore();
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
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: SHEET.cream,
        windowWidth: 1280,
        onclone: (doc) => {
          const card = doc.querySelector('.sheet-card');
          if (card) applyDownloadStyles(card);
        }
      });
      paintWatermark(canvas);
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
              <div className={photo ? 'sheet-photo' : 'sheet-photo sheet-photo-empty'}>
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
