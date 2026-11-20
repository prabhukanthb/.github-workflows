import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import ProfileModal from '../components/ProfileModal';
import Watermark from '../components/Watermark';
import { mainPhotoUrl } from '../profileFields';
import { ageFromDob, communityLabel, fullName, REGISTER_CTA, REGISTRATION_FEE } from '../siteConfig';

export default function Browse() {
  const { token, user, isAuthenticated, loading } = useAuth();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [profiles, setProfiles] = useState([]);
  const [viewer, setViewer] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState(false);
  const announced = useRef(false);

  useEffect(() => {
    if (loading) return undefined;
    if (!token) {
      setBusy(false);
      return undefined;
    }
    let active = true;
    const search = new URLSearchParams(params);
    if (query) search.set('q', query);
    api.browse(token, search.toString())
      .then((data) => {
        if (!active) return;
        const rows = data.profiles || [];
        setProfiles(rows);
        setViewer(data.viewer);
        const open = data.viewer?.approvalStatus === 'approved' && data.viewer?.showInSearch !== false;
        const office = user?.role === 'admin' || user?.role === 'subadmin';
        if (!office && !open && rows.length && !announced.current) {
          announced.current = true;
          setNotice(true);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [token, loading, params, query, user]);

  if (loading || busy) return <div className="page">Loading profiles…</div>;

  if (!isAuthenticated) {
    return (
      <div className="page" style={{ maxWidth: 680 }}>
        <div className="kicker">Telugu Kalyanamala</div>
        <h2>Please register to view the profile</h2>
        <p>Registration is {REGISTRATION_FEE}. Parents may create the login. Phone numbers stay private until the office approves the biodata.</p>
        <div className="actions">
          <Link to="/register" className="btn-maroon">{REGISTER_CTA}</Link>
          <Link to="/login" className="btn-gold">Login</Link>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';
  const approved = isAdmin || (viewer?.approvalStatus === 'approved' && viewer?.showInSearch !== false);
  const viewerAge = ageFromDob(viewer?.dateOfBirth);
  const faith = communityLabel(viewer?.religion);
  const community = faith === 'Christian' || faith === 'Hindu' ? faith : '';

  return (
    <div className="page">
      <div className="kicker">Telugu Kalyanamala</div>
      <h2>Browse profiles</h2>
      {error && <div className="error">{error}</div>}
      {!isAdmin && viewer?.gender && viewerAge && (
        <p>
          {viewer.gender === 'female'
            ? `Showing ${community ? `${community} ` : ''}males older than you (${viewerAge}).`
            : `Showing ${community ? `${community} ` : ''}females aged ${viewerAge} or younger.`}
        </p>
      )}
      {!approved && (
        <div className="notice">Please check with the admin. Profiles stay blurred until the Vijayawada office approves your biodata.</div>
      )}
      {!isAdmin && (!viewer?.gender || !viewerAge) && (
        <div className="notice">Complete your biodata before matches can be shown. <Link to="/profile">Open my profile</Link></div>
      )}
      <div className="panel filters">
        <div>
          <label htmlFor="browse-q">Name, work or profile ID</label>
          <input id="browse-q" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>
      <p>{profiles.length} profile(s) found</p>
      <div className="profile-grid">
        {profiles.map((profile) => {
          const name = fullName(profile);
          const photo = mainPhotoUrl(profile.photos);
          return (
            <article key={profile.id} className={approved ? 'profile-card' : 'profile-card is-restricted'}>
              <div className="card-photo">
                {photo ? <img src={photo} alt="" draggable={approved} /> : <div className="avatar">{approved ? name.slice(0, 1) : ''}</div>}
                {approved && <Watermark variant="photo" />}
              </div>
              <div className="meta">
                <strong className="blur-target">{name}</strong>
                <div className="blur-target">{profile.profileId} · {ageFromDob(profile.dateOfBirth)} yrs</div>
                <div className="blur-target">{[profile.occupation, profile.currentAddress?.city].filter(Boolean).join(' · ')}</div>
                <button
                  type="button"
                  className="btn-maroon"
                  style={{ marginTop: 10 }}
                  onClick={() => (approved ? setSelected(profile) : setNotice(true))}
                >
                  View biodata
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {notice && (
        <div className="modal-back" onClick={() => setNotice(false)} role="presentation">
          <div className="modal access-notice" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Please check with the admin">
            <div className="body">
              <h2>Please check with the admin</h2>
              <p>Your login is registered. Profiles and interest open after the Vijayawada office approves the biodata.</p>
              <div className="actions">
                <Link to="/profile" className="btn-maroon">Open my biodata</Link>
                <button type="button" className="btn-close" onClick={() => setNotice(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selected && approved && (
        <ProfileModal
          profile={selected}
          onClose={() => setSelected(null)}
          onInterest={async (profileId) => {
            const data = await api.sendInterest(profileId, token);
            return data.message;
          }}
        />
      )}
    </div>
  );
}
