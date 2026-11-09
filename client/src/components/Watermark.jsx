import React from 'react';
import { BRAND } from '../siteConfig';

export default function Watermark({ variant = 'sheet' }) {
  const rows = variant === 'photo' ? 4 : 7;
  const cols = variant === 'photo' ? 2 : 3;
  return (
    <div className={`wm wm-${variant}`} aria-hidden="true">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row}>
          {Array.from({ length: cols }, (__, col) => (
            <span key={col}>{BRAND}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
