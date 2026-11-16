import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import ProfileSheet from '../components/ProfileSheet';
import { fullName, genderLabel } from '../siteConfig';
import {
  genderTotals,
  matchesPick,
  pickTitle,
  profilesInScope,
  qualificationRows,
  religionRows,
  samePick
} from '../officeStats';

function Count({ count, label, selected, onClick }) {
  return (
    <button
      type="button"
      className={`dash-cell${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <strong>{count}</strong>
      {label}
    </button>
  );
}

function Matrix({ title, rows, kind, pick, onPick }) {
  return (
    <section className="panel dash-panel">
      <h2>{title}</h2>
      <div className="dash-row dash-head">
        <span />
        <span>Male</span>
        <span>Female</span>
      </div>
      {rows.length === 0 && <p>No profiles in this view yet.</p>}
      {rows.map((row) => (
        <div className="dash-row" key={row.label}>
          <span className="dash-label">{row.label}</span>
          <Count
            count={row.male}
            label="Male"
            selected={samePick(pick, { kind, label: row.label, gender: 'male' })}
            onClick={() => onPick({ kind, label: row.label, gender: 'male' })}
          />
          <Count
            count={row.female}
            label="Female"
            selected={samePick(pick, { kind, label: row.label, gender: 'female' })}
            onClick={() => onPick({ kind, label: row.label, gender: 'female' })}
          />
        </div>
      ))}
    </section>
  );
}

export default function Dashboard() {
  const { token, user, isAuthenticated, loading } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';
  const [profiles, setProfiles] = useState([]);
  const [scope, setScope] = useState('search');
  const [pick, setPick] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !isAdmin) return;
    api.adminProfiles(token).then((data) => setProfiles(data.profiles || [])).catch((err) => setError(err.message));
  }, [token, isAdmin]);

  if (loading) return <div className="page">Loading…</div>;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;

  const scoped = profilesInScope(profiles, scope);
  const totals = genderTotals(scoped);
  const chosen = pick ? scoped.filter((profile) => matchesPick(profile, pick)) : [];

  const choose = (next) => setPick((current) => (samePick(current, next) ? null : next));

  return (
    <div className="page dash-board">
      <div className="kicker">Vijayawada office</div>
      <h2>Dashboard</h2>
      <p>Male and female counts by community and qualification. Click a number to see those profiles. Deleted profiles are not counted. <Link to="/admin">Back to the office list</Link>.</p>
      {error && <div className="error">{error}</div>}
      <div className="dash-scope">
        <button type="button" className={scope === 'search' ? 'btn-maroon' : 'btn-gold'} onClick={() => { setScope('search'); setPick(null); }}>In search</button>
        <button type="button" className={scope === 'all' ? 'btn-maroon' : 'btn-gold'} onClick={() => { setScope('all'); setPick(null); }}>All current profiles</button>
      </div>
      <div className="dash-genders">
        <Count count={totals.male} label="Male" selected={samePick(pick, { kind: 'gender', gender: 'male' })} onClick={() => choose({ kind: 'gender', gender: 'male' })} />
        <Count count={totals.female} label="Female" selected={samePick(pick, { kind: 'gender', gender: 'female' })} onClick={() => choose({ kind: 'gender', gender: 'female' })} />
      </div>
      <Matrix title="By community" rows={religionRows(scoped)} kind="religion" pick={pick} onPick={choose} />
      <Matrix title="By qualification" rows={qualificationRows(scoped)} kind="qualification" pick={pick} onPick={choose} />
      {pick && (
        <section className="panel">
          <h2>{pickTitle(pick)} · {chosen.length}</h2>
          {chosen.length === 0 ? <p>No profiles in this group.</p> : (
            <table className="admin">
              <thead>
                <tr><th>Name</th><th>Profile ID</th><th>Community</th><th>Gender</th><th>Qualification</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {chosen.map((profile) => (
                  <tr key={profile.id}>
                    <td>{fullName(profile)}</td>
                    <td>{profile.profileId || '—'}</td>
                    <td>{profile.religion || '—'}</td>
                    <td>{genderLabel(profile.gender) || '—'}</td>
                    <td>{profile.highestEducation || '—'}</td>
                    <td>{profile.approvalStatus}</td>
                    <td className="actions">
                      <button type="button" className="btn-gold" onClick={() => setViewing(profile)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
      {viewing && <ProfileSheet profile={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
