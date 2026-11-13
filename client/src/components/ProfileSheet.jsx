import React, { useRef, useState } from 'react';
import { addressText } from '../addressText';
import { incomeToLacsInput, mainPhotoUrl } from '../profileFields';
import { sheetMarkPoints } from '../sheetWatermark';
import Watermark from './Watermark';
import { BRAND, ORG, ageFromDob, communityLabel, fullName, genderCardLabel, genderLabel, maritalLabel } from '../siteConfig';

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

function dobText(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return '';
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function heightText(profile) {
  if (profile.heightFeet == null || profile.heightFeet === '') return '';
  return `${profile.heightFeet}.${profile.heightInches || 0}`;
}

function Row({ label, value, downloadValue }) {
  return (
    <div className="sheet-row" {...(downloadValue == null ? {} : { 'data-download-value': downloadValue })}>
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
    'box-sizing:border-box',
    `color:${SHEET.ink}`,
    `width:${cardWidth}px`,
    'max-width:none',
    'font-family:Georgia, Times New Roman, serif'
  ].join(';');
  card.querySelectorAll('.wm, .sheet-watermark').forEach((node) => node.remove());
  const inner = card.querySelector('.sheet-inner');
  if (inner) inner.style.cssText = 'position:relative;z-index:1;background:transparent;';
  const head = card.querySelector('.sheet-head');
  if (head) {
    head.style.cssText = `display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 22px;background:${SHEET.deep};color:${SHEET.cream};`;
  }
  const kicker = card.querySelector('.sheet-kicker');
  if (kicker) kicker.style.cssText = `letter-spacing:1.6px;text-transform:uppercase;font-size:12px;color:${SHEET.blush};font-weight:700;`;
  const brand = card.querySelector('.sheet-brand');
  if (brand) brand.style.cssText = 'font-family:Georgia, Times New Roman, serif;font-size:28px;color:#F7F4EC;line-height:1.1;';
  const managed = card.querySelector('.sheet-managed');
  if (managed) managed.style.cssText = 'margin-top:4px;font-family:Segoe UI, Arial, sans-serif;font-size:14px;font-weight:600;color:#F7F4EC;';
  const id = card.querySelector('.sheet-id');
  if (id) id.style.cssText = `background:#fff;color:${SHEET.scarlet};border-radius:8px;padding:8px 14px;text-align:right;`;
  const idLabel = card.querySelector('.sheet-id span');
  if (idLabel) idLabel.style.cssText = 'display:block;font-size:12px;letter-spacing:1px;text-transform:uppercase;';
  const idValue = card.querySelector('.sheet-id strong');
  if (idValue) idValue.style.cssText = `font-family:Georgia, Times New Roman, serif;font-size:22px;color:${SHEET.scarlet};`;
  const community = card.querySelector('.sheet-community');
  if (community) community.style.cssText = `display:block;font-family:Georgia, Times New Roman, serif;font-size:16px;font-weight:700;letter-spacing:0;text-transform:none;color:${SHEET.scarlet};margin-bottom:4px;`;
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
      'overflow:hidden'
    ].join(';');
  }
  const img = photo?.querySelector('img');
  if (img) {
    img.style.cssText = 'width:100%;height:auto;max-height:640px;object-fit:contain;object-position:center top;display:block;';
  }
  const foot = card.querySelector('.sheet-foot');
  if (foot) {
    foot.style.cssText = `padding:12px 22px;text-align:center;font-weight:700;background:${SHEET.deep};color:${SHEET.cream};font-family:Segoe UI, Arial, sans-serif;`;
  }
}

const SHEET_MARK_FONT = '700 22px Georgia, Times New Roman, serif';

function drawSheetMark(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-18 * Math.PI / 180);
  ctx.font = SHEET_MARK_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = '#F7F4EC';
  ctx.strokeText(BRAND, 0, 0);
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = SHEET.deep;
  ctx.fillText(BRAND, 0, 0);
  ctx.restore();
}

function paintWatermark(canvas, photoBox) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const snapshot = photoSnapshot(ctx, canvas, photoBox);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  if (snapshot) {
    ctx.rect(snapshot.x, snapshot.y, snapshot.w, snapshot.h);
    ctx.clip('evenodd');
  } else {
    ctx.clip();
  }
  ctx.font = SHEET_MARK_FONT;
  const measured = ctx.measureText(BRAND).width;
  const textWidth = measured > 40 ? measured : 220;
  const photo = snapshot ? { x: snapshot.x, y: snapshot.y, w: snapshot.w, h: snapshot.h } : null;
  for (const point of sheetMarkPoints(canvas.width, canvas.height, photo, textWidth)) {
    drawSheetMark(ctx, point.x, point.y);
  }
  ctx.restore();
  if (!snapshot) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.putImageData(snapshot.data, snapshot.x, snapshot.y);
  paintPhotoEdges(ctx, snapshot);
}

function photoSnapshot(ctx, canvas, photoBox) {
  if (!photoBox) return null;
  const x = Math.max(0, Math.min(canvas.width - 1, photoBox.x));
  const y = Math.max(0, Math.min(canvas.height - 1, photoBox.y));
  const w = Math.min(photoBox.w, canvas.width - x);
  const h = Math.min(photoBox.h, canvas.height - y);
  if (w < 8 || h < 8) return null;
  return { x, y, w, h, data: ctx.getImageData(x, y, w, h) };
}

function paintPhotoEdges(ctx, box) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  let fontSize = Math.max(16, Math.round(Math.min(box.w, box.h) * 0.055));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fit = () => {
    ctx.font = `700 ${fontSize}px Georgia, Times New Roman, serif`;
  };
  fit();
  while (fontSize > 12 && ctx.measureText(BRAND).width > box.w - 16) {
    fontSize -= 1;
    fit();
  }
  ctx.lineWidth = Math.max(2, Math.round(fontSize / 8));
  ctx.strokeStyle = 'rgba(44, 51, 40, 0.72)';
  ctx.fillStyle = '#ffffff';
  const x = box.x + box.w / 2;
  const pad = Math.max(fontSize * 0.7, 14);
  ctx.strokeText(BRAND, x, box.y + pad);
  ctx.fillText(BRAND, x, box.y + pad);
  ctx.strokeText(BRAND, x, box.y + box.h - pad);
  ctx.fillText(BRAND, x, box.y + box.h - pad);
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
      const scale = 2;
      let photoBox = null;
      const canvas = await html2canvas(cardRef.current, {
        scale,
        useCORS: true,
        backgroundColor: SHEET.cream,
        windowWidth: 1280,
        onclone: (doc, card) => {
          if (!card) return;
          card.querySelectorAll('[data-download-value]').forEach((row) => {
            const cell = row.querySelector('div');
            if (cell) cell.textContent = row.getAttribute('data-download-value') || '—';
          });
          applyDownloadStyles(card);
          const photo = card.querySelector('.sheet-photo');
          if (!photo) return;
          const cardRect = card.getBoundingClientRect();
          const photoRect = photo.getBoundingClientRect();
          if (photoRect.width < 8 || photoRect.height < 8) return;
          photoBox = {
            x: Math.round((photoRect.left - cardRect.left) * scale),
            y: Math.round((photoRect.top - cardRect.top) * scale),
            w: Math.round(photoRect.width * scale),
            h: Math.round(photoRect.height * scale)
          };
        }
      });
      paintWatermark(canvas, photoBox);
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
            <button type="button" className="btn-icon btn-download" onClick={download} disabled={busy} aria-label="Download profile" title="Download profile">
              {busy ? '…' : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 4v10" />
                  <path d="M7 11l5 5 5-5" />
                  <path d="M5 19h14" />
                </svg>
              )}
            </button>
          )}
          <button type="button" className="btn-close" onClick={onClose}>Close</button>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="sheet-card" ref={cardRef}>
          <div className="sheet-inner">
            <header className="sheet-head">
              <div>
                <div className="sheet-kicker">Mala community</div>
                <div className="sheet-brand">{BRAND}</div>
                <div className="sheet-managed">Managed by {ORG}</div>
              </div>
              <div className="sheet-id">
                <span className="sheet-community">{[communityLabel(profile.religion), genderCardLabel(profile.gender)].filter(Boolean).join(' ')}</span>
                <span>Profile ID</span>
                <strong>{profile.profileId || '—'}</strong>
              </div>
            </header>
            <div className="sheet-body">
              <div className="sheet-copy">
                <h2>{name || 'Member'}</h2>
                <Row label="Gender" value={genderLabel(profile.gender)} />
                <Row label="Date of birth" value={dobText(profile.dateOfBirth)} />
                <Row label="Time of birth" value={profile.timeOfBirth} />
                <Row label="Place of birth" value={profile.placeOfBirth} />
                <Row label="Age" value={age ? `${age} years` : ''} />
                <Row label="Height" value={heightText(profile)} />
                <Row label="Skin complexion" value={profile.complexion} />
                <Row label="Marital status" value={maritalLabel(profile.maritalStatus)} />
                <Row label="Siblings" value={profile.siblingsCount} />
                <Row label="About Siblings" value={profile.aboutSiblings} />
                <Row label="Sub-community" value={communityLabel(profile.religion)} />
                <Row label="Caste" value="Mala" />
                <Row label="Mother tongue" value={profile.motherTongue} />
                <Row label="Education" value={joinParts([profile.highestEducation, profile.fieldOfStudy, profile.college])} />
                <Row label="Work" value={joinParts([profile.occupation, profile.jobTitle, profile.companyName])} />
                <Row label="Income" value={income ? `${income} lacs` : ''} />
                <Row
                  label="Current address"
                  value={addressText(profile.currentAddress)}
                  downloadValue={addressText(profile.currentAddress, { maskStreetAndArea: true }) || '—'}
                />
                <Row label="Father" value={joinParts([profile.fatherName, profile.fatherOccupation, profile.fatherNativePlace])} />
                <Row label="Mother" value={joinParts([profile.motherName, profile.motherOccupation, profile.motherNativePlace])} />
                {profile.aboutMe && <p className="sheet-note"><strong>About me. </strong>{profile.aboutMe}</p>}
                {profile.partnerRequirement && <p className="sheet-note"><strong>Partner requirement. </strong>{profile.partnerRequirement}</p>}
              </div>
              <div className={photo ? 'sheet-photo' : 'sheet-photo sheet-photo-empty'}>
                {photo ? <img src={photo} alt="" crossOrigin="anonymous" /> : <div>{(name || 'T').slice(0, 1)}</div>}
                <Watermark variant="photo" />
              </div>
            </div>
            <footer className="sheet-foot">{CONTACT_LINE}</footer>
          </div>
          <Watermark variant="sheet" />
        </div>
      </div>
    </div>
  );
}
