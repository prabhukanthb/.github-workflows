import React from 'react';
import { BRAND } from '../siteConfig';

export default function Watermark({ variant = 'sheet' }) {
  if (variant === 'photo') {
    return (
      <div className="wm wm-photo" aria-hidden="true">
        <span>{BRAND}</span>
        <span>{BRAND}</span>
      </div>
    );
  }
  const rows = 7;
  const cols = 3;
  return (
    <div className="wm wm-sheet" aria-hidden="true">
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
