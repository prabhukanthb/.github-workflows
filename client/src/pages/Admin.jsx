import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import BiodataForm, { profileToForm } from '../components/BiodataForm';
import { ageFromDob, fullName } from '../siteConfig';

export default function Admin() {
  const { token, user, isAuthenticated, loading } = useAuth();
  const [summary, setSummary] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

  const load = () => {
    if (!token) return;
    Promise.all([api.adminSummary(token), api.adminProfiles(token)])
      .then(([summaryData, profileData]) => {
        setSummary(summaryData);
        setProfiles(profileData.profiles || []);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    if (token && isAdmin) load();
  }, [token, isAdmin]);

  if (loading) return <div className="page">Loading…</div>;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;

  const visible = profiles.filter((profile) => filter === 'all' || profile.approvalStatus === filter);

  const decide = async (profile, approvalStatus) => {
    setError('');
    try {
      await api.adminUpdate(profile.id, { approvalStatus }, token);
      setMessage(approvalStatus === 'approved' ? `${fullName(profile)} is now in search.` : `${fullName(profile)} was not published.`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="kicker">Vijayawada office</div>
      <h2>Admin</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="ok">{message}</div>}
      {summary && (
        <div className="stats">
          {[
            ['Members', summary.users],
            ['Biodata', summary.profiles],
            ['Waiting', summary.pending],
            ['In search', summary.approved]
          ].map(([label, value]) => (
            <article key={label} className="counter-card"><strong>{value}</strong>{label}</article>
          ))}
        </div>
      )}
      <div className="panel create-banner">
        <div>
          <h2>Create a profile</h2>
          <p>Add a bride or groom biodata for a family. Office staff do not have a member profile.</p>
        </div>
        <Link to="/admin/create" className="btn-gold">Create profile</Link>
      </div>
      <div className="actions" style={{ marginBottom: 16 }}>
        {['pending', 'approved', 'rejected', 'draft', 'all'].map((item) => (
          <button key={item} type="button" className={filter === item ? 'btn-maroon' : 'btn-gold'} onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Details</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((profile) => (
              <tr key={profile.id}>
                <td>
                  <strong>{fullName(profile)}</strong>
                  <div>{profile.profileId || 'No ID yet'}</div>
                  <div>{profile.phone}</div>
                </td>
                <td>
                  {profile.gender === 'female' ? 'Bride' : 'Groom'} · {ageFromDob(profile.dateOfBirth) || '—'}
                  <div>{profile.occupation} · {profile.currentAddress?.city}</div>
                </td>
                <td>{profile.approvalStatus}</td>
                <td className="actions">
                  {profile.approvalStatus !== 'approved' && (
                    <button type="button" className="btn-maroon" onClick={() => decide(profile, 'approved')}>Approve</button>
                  )}
                  {profile.approvalStatus !== 'rejected' && (
                    <button type="button" className="btn-gold" onClick={() => decide(profile, 'rejected')}>Hold</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 16 }}><Link to="/browse">Open search</Link></p>
    </div>
  );
}

export function CreateProfile() {
  const { token, user, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState(profileToForm());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

  if (loading) return <div className="page">Loading…</div>;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;

  const create = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const data = await api.adminCreate(form, token);
      setMessage(`${fullName(data.profile)} is in search as ${data.profile.profileId}. You can add another family now.`);
      setForm(profileToForm());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="kicker">Vijayawada office</div>
      <h2>Create profile</h2>
      <p><Link to="/admin">Back to the office list</Link></p>
      {error && <div className="error">{error}</div>}
      {message && <div className="ok">{message}</div>}
      <form className="panel" onSubmit={create}>
        <BiodataForm form={form} setForm={setForm} includeAccount />
        <p>Leave the password empty and the family can login with Member@12345, then change it.</p>
        <button className="btn-maroon" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Create profile'}</button>
      </form>
    </div>
  );
}
