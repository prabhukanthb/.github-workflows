import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import ProfileModal from '../components/ProfileModal';
import { ageFromDob, fullName, REGISTER_CTA, REGISTRATION_FEE } from '../siteConfig';

export default function Browse() {
  const { token, user, isAuthenticated, loading } = useAuth();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [profiles, setProfiles] = useState([]);
  const [viewer, setViewer] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [selected, setSelected] = useState(null);

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
        setProfiles(data.profiles || []);
        setViewer(data.viewer);
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
  }, [token, loading, params, query]);

  if (loading || busy) return <div className="page">Loading profiles…</div>;

  if (!isAuthenticated) {
    return (
      <div className="page" style={{ maxWidth: 680 }}>
        <div className="kicker">Telugu Kalyanamala</div>
        <h2>Search profiles</h2>
        <p>Register to view Mala matches. Registration is {REGISTRATION_FEE}. Parents may create the login. Phone numbers stay private.</p>
        <div className="actions">
          <Link to="/register" className="btn-maroon">{REGISTER_CTA}</Link>
          <Link to="/login" className="btn-gold">Login</Link>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';
  const viewerAge = ageFromDob(viewer?.dateOfBirth);

  return (
    <div className="page">
      <div className="kicker">Telugu Kalyanamala</div>
      <h2>Browse profiles</h2>
      {error && <div className="error">{error}</div>}
      {!isAdmin && viewer?.gender && viewerAge && (
        <p>
          {viewer.gender === 'female'
            ? `Showing grooms older than you (${viewerAge}).`
            : `Showing brides aged ${viewerAge} or younger.`}
        </p>
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
          const photo = profile.photos?.[0]?.url;
          return (
            <article key={profile.id} className="profile-card">
              {photo ? <img src={photo} alt="" /> : <div className="avatar">{name.slice(0, 1)}</div>}
              <div className="meta">
                <strong>{name}</strong>
                <div>{profile.profileId} · {ageFromDob(profile.dateOfBirth)} yrs</div>
                <div>{[profile.occupation, profile.currentAddress?.city].filter(Boolean).join(' · ')}</div>
                <button type="button" className="btn-maroon" style={{ marginTop: 10 }} onClick={() => setSelected(profile)}>
                  View biodata
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {selected && (
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
