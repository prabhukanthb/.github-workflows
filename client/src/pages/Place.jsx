import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { landingFor } from '../seoPages';
import { HELPLINE_DISPLAY, HELPLINE_TEL, REGISTER_CTA } from '../siteConfig';

const RELATED = [
  { to: '/andhra-pradesh', label: 'Andhra Pradesh' },
  { to: '/telangana', label: 'Telangana' },
  { to: '/hindu-mala-matrimony', label: 'Hindu Mala matrimony' },
  { to: '/christian-mala-matrimony', label: 'Christian Mala matrimony' }
];

export default function Place() {
  const { pathname } = useLocation();
  const page = landingFor(pathname);
  if (!page) return <Navigate to="/" replace />;
  return (
    <div className="section place-page">
      <p className="kicker">Telugu Mala matrimony</p>
      <h1>{page.h1}</h1>
      {page.paragraphs.map((paragraph) => <p key={paragraph} className="sub">{paragraph}</p>)}
      {page.places.length > 0 && (
        <>
          <h2>Cities families come from</h2>
          <ul className="place-list">
            {page.places.map((place) => <li key={place}>{place}</li>)}
          </ul>
        </>
      )}
      <div className="hero-actions">
        <Link to="/register" className="btn-gold">{REGISTER_CTA}</Link>
        <a href={HELPLINE_TEL} className="btn-maroon">Call {HELPLINE_DISPLAY}</a>
      </div>
      <p className="sub" style={{ marginTop: 28 }}>
        Also see{' '}
        {RELATED.filter((item) => item.to !== page.path).map((item, index, list) => (
          <React.Fragment key={item.to}>
            <Link to={item.to}>{item.label}</Link>
            {index < list.length - 1 ? ' · ' : ''}
          </React.Fragment>
        ))}
        {' '}and the <Link to="/">home page</Link>.
      </p>
    </div>
  );
}
