import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import BiodataForm, { profileToForm } from '../components/BiodataForm';
import ProfileSheet from '../components/ProfileSheet';
import { ageFromDob, fullName } from '../siteConfig';

export default function Admin() {
  const { token, user, isAuthenticated, loading } = useAuth();
  const [summary, setSummary] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [staff, setStaff] = useState([]);
  const [staffForm, setStaffForm] = useState({ firstName: '', surname: '', email: '', phone: '', role: 'subadmin', password: '' });
  const [viewing, setViewing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

  const load = () => {
    if (!token) return;
    Promise.all([api.adminSummary(token), api.adminProfiles(token), api.adminStaff(token)])
      .then(([summaryData, profileData, staffData]) => {
        setSummary(summaryData);
        setProfiles(profileData.profiles || []);
        setStaff(staffData.staff || []);
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
                  <button type="button" className="btn-maroon" onClick={() => setViewing(profile)}>View</button>
                  <Link to={`/admin/profiles/${profile.id}/edit`}>Edit</Link>
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
          <BiodataForm form={form} setForm={setForm} includeAccount={false} />
          <button className="btn-maroon" style={{ marginTop: 16 }} type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
        </form>
      )}
      {viewing && profile && (
        <ProfileSheet profile={profile} allowDownload onClose={() => setViewing(false)} />
      )}
    </div>
  );
}
