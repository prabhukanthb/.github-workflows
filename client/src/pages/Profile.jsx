import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import BiodataForm, { profileToForm } from '../components/BiodataForm';
import { fullName } from '../siteConfig';

export default function Profile() {
  const { token, isAuthenticated, loading, user } = useAuth();
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState('');
  const [profileId, setProfileId] = useState('');
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    Promise.all([api.myProfile(token), api.interests(token)])
      .then(([profileData, interestData]) => {
        if (!active) return;
        setForm(profileToForm(profileData.profile, user));
        setStatus(profileData.profile.approvalStatus);
        setProfileId(profileData.profile.profileId || '');
        setInterests(interestData.interests || []);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [token, user]);

  if (loading) return <div className="page">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin' || user?.role === 'subadmin') return <Navigate to="/admin" replace />;

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const data = await api.saveProfile(form, token);
      setStatus(data.profile.approvalStatus);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const respond = async (id, next) => {
    const data = await api.respondInterest(id, next, token);
    setMessage(data.message);
    const refreshed = await api.interests(token);
    setInterests(refreshed.interests || []);
  };

  return (
    <div className="page">
      <div className="kicker">Telugu Kalyanamala</div>
      <h2>My biodata</h2>
      <p>
        Status: <strong>{status || 'draft'}</strong>
        {profileId ? ` · Profile ID ${profileId}` : ''}
        {' · '}<Link to="/change-password">Change password</Link>
      </p>
      <div className="notice">Phone numbers are hidden from other families. The Vijayawada office reviews every biodata before it appears in search.</div>
      {error && <div className="error">{error}</div>}
      {message && <div className="ok">{message}</div>}
      {!form ? <p>Loading biodata…</p> : (
        <form className="panel" onSubmit={save}>
          <BiodataForm form={form} setForm={setForm} />
          <button className="btn-maroon" style={{ marginTop: 16 }} disabled={busy} type="submit">
            {busy ? 'Saving…' : 'Submit for review'}
          </button>
        </form>
      )}

      <h2 style={{ marginTop: 36 }}>Interests</h2>
      {interests.length === 0 && <p>No interests yet.</p>}
      <div className="profile-grid">
        {interests.map((item) => (
          <article key={item.id} className="why-card">
            <h3>{fullName(item.profile) || item.fromName}</h3>
            <p>{item.incoming ? 'Received' : 'Sent'} · {item.status}</p>
            {item.incoming && item.status === 'pending' && (
              <div className="actions">
                <button type="button" className="btn-maroon" onClick={() => respond(item.id, 'accepted')}>Accept</button>
                <button type="button" className="btn-gold" onClick={() => respond(item.id, 'declined')}>Decline</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
