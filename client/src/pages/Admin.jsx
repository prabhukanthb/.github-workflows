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
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(profileToForm());
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

  const create = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = await api.adminCreate(form, token);
      setMessage(`${fullName(data.profile)} published as ${data.profile.profileId}.`);
      setCreating(false);
      setForm(profileToForm());
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
      <div className="actions" style={{ marginBottom: 16 }}>
        <button type="button" className="btn-gold" onClick={() => setCreating((value) => !value)}>
          {creating ? 'Close form' : 'Add a profile'}
        </button>
        {['pending', 'approved', 'rejected', 'draft', 'all'].map((item) => (
          <button key={item} type="button" className={filter === item ? 'btn-maroon' : 'btn-gold'} onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>
      {creating && (
        <form className="panel" style={{ marginBottom: 20 }} onSubmit={create}>
          <h2>New member</h2>
          <BiodataForm form={form} setForm={setForm} includeAccount />
          <p>If you leave password empty, the member can login with Member@12345 and should change it.</p>
          <button className="btn-maroon" type="submit">Publish profile</button>
        </form>
      )}
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
