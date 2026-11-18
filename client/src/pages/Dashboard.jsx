import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import ProfileSheet from '../components/ProfileSheet';
import { fullName, genderLabel } from '../siteConfig';
import {
  barsWithAtLeast,
  genderTotals,
  matchesPick,
  pickTitle,
  profilesInScope,
  jobRows,
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

function BarRow({ count, gender, max, selected, onClick }) {
  const width = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <button type="button" className={`dash-bar${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={onClick}>
      <span className="dash-bar-track">
        <span className={`dash-bar-fill ${gender}`} style={{ width: `${width}%` }} />
      </span>
      <span className="dash-bar-count">{count} {gender === 'male' ? 'Male' : 'Female'}</span>
    </button>
  );
}

function VerticalBar({ count, gender, max, selected, label, onClick }) {
  const height = max > 0 ? Math.round((count / max) * 100) : 0;
  const name = gender === 'male' ? 'Male' : 'Female';
  return (
    <button
      type="button"
      className={`dash-vbar${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      aria-label={`${count} ${name} ${label}`}
      onClick={onClick}
    >
      <span className="dash-vbar-count">{count}</span>
      <span className="dash-vbar-track">
        <span className={`dash-vbar-fill ${gender}`} style={{ height: `${height}%` }} />
      </span>
      <span className="dash-vbar-name">{name}</span>
    </button>
  );
}

function VerticalChart({ title, rows, kind, pick, onPick }) {
  const visible = barsWithAtLeast(rows);
  const max = Math.max(1, ...visible.flatMap((row) => [
    row.showMale ? row.male : 0,
    row.showFemale ? row.female : 0
  ]));
  return (
    <section className="panel dash-panel">
      <h2>{title}</h2>
      <div className="dash-legend">
        <span><i className="dash-swatch male" /> Male</span>
        <span><i className="dash-swatch female" /> Female</span>
      </div>
      {visible.length === 0 && <p>No group has 2 or more profiles yet.</p>}
      <div className="dash-columns">
        {visible.map((row) => (
          <div className="dash-column" key={row.label}>
            <div className="dash-column-bars">
              {row.showMale && (
                <VerticalBar
                  count={row.male}
                  gender="male"
                  max={max}
                  label={row.label}
                  selected={samePick(pick, { kind, label: row.label, gender: 'male' })}
                  onClick={() => onPick({ kind, label: row.label, gender: 'male' })}
                />
              )}
              {row.showFemale && (
                <VerticalBar
                  count={row.female}
                  gender="female"
                  max={max}
                  label={row.label}
                  selected={samePick(pick, { kind, label: row.label, gender: 'female' })}
                  onClick={() => onPick({ kind, label: row.label, gender: 'female' })}
                />
              )}
            </div>
            <div className="dash-label">{row.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Matrix({ title, rows, kind, pick, onPick }) {
  const max = Math.max(1, ...rows.flatMap((row) => [row.male, row.female]));
  return (
    <section className="panel dash-panel">
      <h2>{title}</h2>
      <div className="dash-legend">
        <span><i className="dash-swatch male" /> Male</span>
        <span><i className="dash-swatch female" /> Female</span>
      </div>
      {rows.length === 0 && <p>No profiles in this view yet.</p>}
      {rows.map((row) => (
        <div className="dash-chart-row" key={row.label}>
          <div className="dash-label">{row.label}</div>
          <BarRow
            count={row.male}
            gender="male"
            max={max}
            selected={samePick(pick, { kind, label: row.label, gender: 'male' })}
            onClick={() => onPick({ kind, label: row.label, gender: 'male' })}
          />
          <BarRow
            count={row.female}
            gender="female"
            max={max}
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
      <p>Male and female counts by community, qualification, and job. Community and qualification use upright bars, and a bar is shown only when that side has at least 2 profiles. Click a bar to see those profiles. Deleted profiles are not counted. <Link to="/admin">Back to the office list</Link>.</p>
      {error && <div className="error">{error}</div>}
      <div className="dash-scope">
        <button type="button" className={scope === 'search' ? 'btn-maroon' : 'btn-gold'} onClick={() => { setScope('search'); setPick(null); }}>In search</button>
        <button type="button" className={scope === 'all' ? 'btn-maroon' : 'btn-gold'} onClick={() => { setScope('all'); setPick(null); }}>All current profiles</button>
      </div>
      <div className="dash-genders">
        <Count count={totals.male} label="Male" selected={samePick(pick, { kind: 'gender', gender: 'male' })} onClick={() => choose({ kind: 'gender', gender: 'male' })} />
        <Count count={totals.female} label="Female" selected={samePick(pick, { kind: 'gender', gender: 'female' })} onClick={() => choose({ kind: 'gender', gender: 'female' })} />
      </div>
      <VerticalChart title="By community" rows={religionRows(scoped)} kind="religion" pick={pick} onPick={choose} />
      <VerticalChart title="By qualification" rows={qualificationRows(scoped)} kind="qualification" pick={pick} onPick={choose} />
      <Matrix title="By job" rows={jobRows(scoped)} kind="job" pick={pick} onPick={choose} />
      {pick && (
        <section className="panel">
          <h2>{pickTitle(pick)} · {chosen.length}</h2>
          {chosen.length === 0 ? <p>No profiles in this group.</p> : (
            <table className="admin">
              <thead>
                <tr><th>Name</th><th>Profile ID</th><th>Community</th><th>Gender</th><th>Qualification</th><th>Work</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {chosen.map((profile) => (
                  <tr key={profile.id}>
                    <td>{fullName(profile)}</td>
                    <td>{profile.profileId || '—'}</td>
                    <td>{profile.religion || '—'}</td>
                    <td>{genderLabel(profile.gender) || '—'}</td>
                    <td>{profile.highestEducation || '—'}</td>
                    <td>{profile.occupation || '—'}</td>
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
