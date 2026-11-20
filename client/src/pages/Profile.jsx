import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import BiodataForm, { profileToForm } from '../components/BiodataForm';
import ProfileSheet from '../components/ProfileSheet';

export default function Profile() {
  const { token, isAuthenticated, loading, user } = useAuth();
  const [form, setForm] = useState(null);
  const [profile, setProfile] = useState(null);
  const [viewing, setViewing] = useState(false);
  const [status, setStatus] = useState('');
  const [profileId, setProfileId] = useState('');
  const [earlierProfileId, setEarlierProfileId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    api.myProfile(token)
      .then((profileData) => {
        if (!active) return;
        setProfile(profileData.profile);
        setForm(profileToForm(profileData.profile, user));
        setStatus(profileData.profile.approvalStatus);
        setProfileId(profileData.profile.profileId || '');
        setEarlierProfileId(profileData.profile.earlierProfileId || '');
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
      setProfile(data.profile);
      setStatus(data.profile.approvalStatus);
      setProfileId(data.profile.profileId || '');
      setEarlierProfileId(data.profile.earlierProfileId || '');
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="kicker">Telugu Kalyanamala</div>
      <h2>My biodata</h2>
      <p>
        Status: <strong>{status || 'draft'}</strong>
        {profileId ? ` · Profile ID ${profileId}` : ''}
        {earlierProfileId ? ` (was ${earlierProfileId})` : ''}
        {' · '}<Link to="/change-password">Change password</Link>
      </p>
      {profile && (
        <p>
          <button type="button" className="btn-maroon" onClick={() => setViewing(true)}>View my profile</button>
        </p>
      )}
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

      {viewing && profile && (
        <ProfileSheet profile={profile} onClose={() => setViewing(false)} />
      )}
      <p style={{ marginTop: 24 }}><Link to="/interests">Interest notifications</Link> are on their own page and stay for 7 days.</p>
    </div>
  );
}
