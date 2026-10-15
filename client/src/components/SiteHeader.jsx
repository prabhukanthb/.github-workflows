import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { BRAND, HELPLINE_DISPLAY, HELPLINE_TEL, REGISTER_CTA } from '../siteConfig';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About Us', hash: 'about' },
  { label: 'Search Profiles', to: '/browse' }
];

export default function SiteHeader() {
  const { isAuthenticated, logout, user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [pendingInterests, setPendingInterests] = useState(0);
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

  useEffect(() => {
    if (!token || !isAdmin) {
      setPendingInterests(0);
      return undefined;
    }
    let active = true;
    api.adminSummary(token)
      .then((data) => {
        if (active) setPendingInterests(data.pendingInterests || 0);
      })
      .catch(() => {
        if (active) setPendingInterests(0);
      });
    return () => {
      active = false;
    };
  }, [token, isAdmin, location.pathname]);

  const goHash = (id) => {
    setOpen(false);
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate(`/#${id}`);
  };

  return (
    <header className="site-header">
      <div className="site-topbar">
        <div>
          Helpline:{' '}
          <a href={HELPLINE_TEL}>{HELPLINE_DISPLAY}</a>
        </div>
      </div>
      <div className="site-header-inner">
        <Link to="/" className="site-logo" onClick={() => setOpen(false)}>
          <span className="site-mark" aria-hidden="true">TK</span>
          {BRAND}
        </Link>
        <nav className={open ? 'site-nav open' : 'site-nav'} aria-label="Main">
          {NAV.map((item) => (
            item.hash ? (
              <button key={item.label} type="button" className="linkish" onClick={() => goHash(item.hash)}>
                {item.label}
              </button>
            ) : (
              <Link key={item.label} to={item.to} onClick={() => setOpen(false)}>{item.label}</Link>
            )
          ))}
          {isAuthenticated && !isAdmin && (
            <Link to="/profile" onClick={() => setOpen(false)}>My Profile</Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)}>
              Office{pendingInterests > 0 ? ` (${pendingInterests})` : ''}
            </Link>
          )}
          {isAuthenticated && (
            <>
              <span>Hi, {user.firstName}</span>
              <button type="button" className="btn-ghost" onClick={() => { logout(); setOpen(false); navigate('/'); }}>Logout</button>
            </>
          )}
        </nav>
        <div className="header-cta">
          {isAdmin && (
            <Link to="/admin/create" className="btn-gold" onClick={() => setOpen(false)}>Create profile</Link>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="btn-gold" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="btn-gold" onClick={() => setOpen(false)}>{REGISTER_CTA}</Link>
            </>
          )}
          <button type="button" className="menu-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
    </header>
  );
}
