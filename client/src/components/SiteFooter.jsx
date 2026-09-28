import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, EMAIL, HELPLINE_DISPLAY, HELPLINE_TEL, ORG, REGISTER_CTA, WHATSAPP_HREF } from '../siteConfig';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <strong>{BRAND}</strong>
          <p>Exclusive Mala matrimony, owned and operated by {ORG}. The only office is at Manohara Apartments, Machavaram, Vijayawada.</p>
        </div>
        <div>
          <strong>Explore</strong>
          <p><Link to="/">Home</Link></p>
          <p><Link to="/browse">Search Profiles</Link></p>
          <p><Link to="/register">{REGISTER_CTA}</Link></p>
          <p><Link to="/login">Login</Link></p>
        </div>
        <div>
          <strong>Policies</strong>
          <p><Link to="/privacy">Privacy Policy</Link></p>
          <p><Link to="/terms">Terms of Use</Link></p>
          <p><Link to="/refund">Refund Policy</Link></p>
        </div>
        <div>
          <strong>Contact</strong>
          <p><a href={HELPLINE_TEL}>{HELPLINE_DISPLAY}</a></p>
          <p><a href={WHATSAPP_HREF} target="_blank" rel="noreferrer">WhatsApp the office</a></p>
          <p><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
        </div>
      </div>
      <div className="footer-copy">
        © {new Date().getFullYear()} {ORG}. {BRAND} is for the Mala community. All rights reserved.
      </div>
    </footer>
  );
}
