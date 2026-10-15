import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import BiodataForm, { profileToForm } from '../components/BiodataForm';
import ProfileSheet from '../components/ProfileSheet';
import { ageFromDob, fullName } from '../siteConfig';

function ActionIcon({ name }) {
  if (name === 'view') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
        <circle cx="12" cy="12" r="2.6" />
      </svg>
    );
  }
  if (name === 'edit') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
        <path d="M13.5 6.5l3 3" />
      </svg>
    );
  }
  if (name === 'tick') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (name === 'draft') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3h8l5 5v13H7z" />
        <path d="M15 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export default function Admin() {
  const { token, user, isAuthenticated, loading } = useAuth();
  const [summary, setSummary] = useState(null);
  const [interests, setInterests] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [deleted, setDeleted] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [staff, setStaff] = useState([]);
  const [staffForm, setStaffForm] = useState({ firstName: '', surname: '', email: '', phone: '', role: 'subadmin', password: '' });
  const [viewing, setViewing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';
  const isFullAdmin = user?.role === 'admin';

  const load = () => {
    if (!token) return;
    const staffRequest = isFullAdmin ? api.adminStaff(token) : Promise.resolve({ staff: [] });
    Promise.all([api.adminSummary(token), api.adminProfiles(token), staffRequest, api.adminInterests(token)])
      .then(([summaryData, profileData, staffData, interestData]) => {
        setSummary(summaryData);
        setProfiles(profileData.profiles || []);
        setDeleted(profileData.deleted || []);
        setStaff(staffData.staff || []);
        setInterests(interestData.interests || []);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    if (token && isAdmin) load();
  }, [token, isAdmin]);

  if (loading) return <div className="page">Loading…</div>;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;

  const matched = filter === 'deleted'
    ? deleted
    : profiles.filter((profile) => filter === 'all' || profile.approvalStatus === filter);
  const visible = filter === 'all' ? [...matched].reverse() : matched;

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

  const resetLogin = async (profile) => {
    setError('');
    try {
      const data = await api.adminResetPassword(profile.id, token);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (profile) => {
    const label = `${fullName(profile)}${profile.profileId ? ` (${profile.profileId})` : ''}`;
    if (!window.confirm(`Move ${label} to Deleted? This profile ID will not be used again.`)) return;
    setError('');
    try {
      const data = await api.adminDelete(profile.id, token);
      setMessage(data.message);
      setFilter('deleted');
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
            ['In search', summary.approved],
            ['Interests', summary.pendingInterests]
          ].map(([label, value]) => (
            <article key={label} className="counter-card"><strong>{value}</strong>{label}</article>
          ))}
        </div>
      )}
      <section className="panel">
        <h2>Interest notifications</h2>
        <p>When a member taps Express interest, it appears here for the office. There is no separate email or text message. Call the numbers below and keep them private until both families agree.</p>
        {interests.length === 0 && <p>No interests yet.</p>}
        {interests.length > 0 && (
          <ul className="interest-list">
            {interests.map((item) => (
              <li key={item.id}>
                <strong>{item.from.name}</strong>
                {item.from.profileId ? ` (${item.from.profileId})` : ''}
                {item.from.phone ? ` · ${item.from.phone}` : ''}
                {' interested in '}
                <strong>{item.to.name}</strong>
                {item.to.profileId ? ` (${item.to.profileId})` : ''}
                {item.to.phone ? ` · ${item.to.phone}` : ''}
                {` · ${item.status}`}
                {item.createdAt ? ` · ${new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>
      {isFullAdmin && (
      <form className="panel" onSubmit={async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        try {
          const data = await api.adminCreateStaff(staffForm, token);
          setMessage(`${data.user.firstName} can login as ${data.user.role} with ${data.user.email} and password ${data.temporaryPassword}.`);
          setStaffForm({ firstName: '', surname: '', email: '', phone: '', role: 'subadmin', password: '' });
          load();
        } catch (err) {
          setError(err.message);
        }
      }}>
        <h2>Create admin and subadmin logins</h2>
        <p>These logins open the office and can add profiles. A profile added by an admin or subadmin is approved immediately and appears in search. Leave the password empty to use the first 4 letters of the full name, @, and the last 4 digits of the mobile.</p>
        <div className="form-grid">
          <div>
            <label>Full Name</label>
            <input value={staffForm.firstName} onChange={(event) => setStaffForm({ ...staffForm, firstName: event.target.value })} required />
          </div>
          <div>
            <label>Surname</label>
            <input value={staffForm.surname} onChange={(event) => setStaffForm({ ...staffForm, surname: event.target.value })} required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={staffForm.email} onChange={(event) => setStaffForm({ ...staffForm, email: event.target.value })} required />
          </div>
          <div>
            <label>Phone</label>
            <input inputMode="numeric" value={staffForm.phone} onChange={(event) => setStaffForm({ ...staffForm, phone: event.target.value.replace(/\D/g, '').slice(0, 10) })} required />
          </div>
          <div>
            <label>Role</label>
            <select value={staffForm.role} onChange={(event) => setStaffForm({ ...staffForm, role: event.target.value })}>
              <option value="admin">Admin</option>
              <option value="subadmin">Subadmin</option>
            </select>
          </div>
          <div>
            <label>Password</label>
            <input type="text" value={staffForm.password} onChange={(event) => setStaffForm({ ...staffForm, password: event.target.value })} placeholder="Optional" />
          </div>
        </div>
        <button className="btn-maroon" style={{ marginTop: 16 }} type="submit">Create office login</button>
        {staff.length > 0 && (
          <ul>
            {staff.map((item) => (
              <li key={item.id}>{item.firstName} {item.surname} · {item.email} · {item.phone} · {item.role}</li>
            ))}
          </ul>
        )}
      </form>
      )}
      <div className="panel create-banner">
        <div>
          <h2>Create a profile</h2>
          <p>Add a bride or groom biodata for a family. Office staff do not have a member profile.</p>
        </div>
        <Link to="/admin/create" className="btn-gold">Create profile</Link>
      </div>
      <div className="actions" style={{ marginBottom: 16 }}>
        {[
          ['pending', 'pending'],
          ['approved', 'approved'],
          ['rejected', 'rejected'],
          ['draft', 'draft'],
          ['all', 'All'],
          ['deleted', 'Deleted']
        ].map(([value, label]) => (
          <button key={value} type="button" className={filter === value ? 'btn-maroon' : 'btn-gold'} onClick={() => setFilter(value)}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin">
          <thead>
            <tr>
              <th>Name</th>
              <th>Profile ID</th>
              <th>Phone number</th>
              <th>Age</th>
              <th>Bride/Groom</th>
              <th>Job location</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((profile) => (
              <tr key={profile.id}>
                <td>{fullName(profile)}</td>
                <td>{profile.profileId || '—'}</td>
                <td>{profile.phone || '—'}</td>
                <td>{ageFromDob(profile.dateOfBirth) || '—'}</td>
                <td>{profile.gender === 'female' ? 'Bride' : profile.gender === 'male' ? 'Groom' : '—'}</td>
                <td>{profile.jobLocation || '—'}</td>
                <td>
                  {profile.approvalStatus === 'approved' && (
                    <span className="status-mark approved" title="Approved"><ActionIcon name="tick" /></span>
                  )}
                  {profile.approvalStatus === 'draft' && (
                    <span className="status-mark draft" title="Draft"><ActionIcon name="draft" /></span>
                  )}
                  {profile.approvalStatus !== 'approved' && profile.approvalStatus !== 'draft' && profile.approvalStatus}
                </td>
                <td className="actions">
                  <button type="button" className="btn-icon btn-view" onClick={() => setViewing(profile)} aria-label="View" title="View">
                    <ActionIcon name="view" />
                  </button>
                  {filter !== 'deleted' && (
                    <>
                      <Link className="btn-icon btn-edit" to={`/admin/profiles/${profile.id}/edit`} aria-label="Edit" title="Edit">
                        <ActionIcon name="edit" />
                      </Link>
                      {profile.approvalStatus !== 'approved' && (
                        <button type="button" className="btn-icon btn-tick" onClick={() => decide(profile, 'approved')} aria-label="Approve" title="Approve">
                          <ActionIcon name="tick" />
                        </button>
                      )}
                      {profile.approvalStatus !== 'rejected' && (
                        <button type="button" className="btn-gold" onClick={() => decide(profile, 'rejected')}>Hold</button>
                      )}
                      <button type="button" className="btn-gold" onClick={() => resetLogin(profile)}>Reset password</button>
                      <button type="button" className="btn-icon btn-delete" onClick={() => remove(profile)} aria-label="Delete" title="Delete">
                        <ActionIcon name="delete" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 16 }}><Link to="/browse">Open search</Link></p>
      {viewing && (
        <ProfileSheet profile={viewing} allowDownload onClose={() => setViewing(null)} />
      )}
    </div>
  );
}

export function CreateProfile() {
  const { token, user, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState(profileToForm());
  const [created, setCreated] = useState(null);
  const [viewing, setViewing] = useState(false);
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
      setCreated(data.profile);
      setViewing(true);
      setMessage(`${fullName(data.profile)} is approved and in search as ${data.profile.profileId}. Login ${data.profile.email} with password ${data.temporaryPassword}.`);
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
      {created && (
        <p>
          <button type="button" className="btn-maroon" onClick={() => setViewing(true)}>View profile</button>
        </p>
      )}
      <form className="panel" onSubmit={create}>
        <BiodataForm form={form} setForm={setForm} includeAccount />
        <p>Leave the password empty and the family can login with the first 4 letters of the full name, @, and the last 4 digits of the mobile. Profiles created here are approved immediately.</p>
        <button className="btn-maroon" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Create profile'}</button>
      </form>
      {viewing && created && (
        <ProfileSheet profile={created} allowDownload onClose={() => setViewing(false)} />
      )}
    </div>
  );
}

export function EditProfile() {
  const { id } = useParams();
  const { token, user, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState(null);
  const [profile, setProfile] = useState(null);
  const [viewing, setViewing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

  useEffect(() => {
    if (!token || !isAdmin) return undefined;
    let active = true;
    api.profile(id, token)
      .then((data) => {
        if (active) {
          setProfile(data.profile);
          setForm(profileToForm(data.profile));
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [token, isAdmin, id]);

  if (loading) return <div className="page">Loading…</div>;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const data = await api.adminUpdate(id, form, token);
      setProfile(data.profile);
      setMessage(`${fullName(data.profile)} was saved.`);
      setForm(profileToForm(data.profile));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="kicker">Vijayawada office</div>
      <h2>Edit profile</h2>
      <p><Link to="/admin">Back to the office list</Link></p>
      {error && <div className="error">{error}</div>}
      {message && <div className="ok">{message}</div>}
      {profile && (
        <p>
          <button type="button" className="btn-maroon" onClick={() => setViewing(true)}>View profile</button>
        </p>
      )}
      {!form ? <p>Loading biodata…</p> : (
        <form className="panel" onSubmit={save}>
          <BiodataForm form={form} setForm={setForm} includeName />
          <button className="btn-maroon" style={{ marginTop: 16 }} type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
        </form>
      )}
      {viewing && profile && (
        <ProfileSheet profile={profile} allowDownload onClose={() => setViewing(false)} />
      )}
    </div>
  );
}
