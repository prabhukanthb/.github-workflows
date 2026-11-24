import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

function dayLabel(day) {
  const [year, month, date] = String(day || '').split('-').map(Number);
  if (!year || !month || !date) return day;
  return new Date(Date.UTC(year, month - 1, date)).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function timeLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}

export default function Logins() {
  const { token, user, isAuthenticated, loading } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';
  const [report, setReport] = useState(null);
  const [day, setDay] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !isAdmin) return undefined;
    let active = true;
    api.adminLogins(token, day)
      .then((data) => {
        if (!active) return;
        setReport(data);
        setError('');
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [token, isAdmin, day]);

  if (loading) return <div className="page">Loading…</div>;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;

  const count = report?.count || 0;
  return (
    <div className="page dash-board">
      <div className="kicker">Vijayawada office</div>
      <h2>Logins</h2>
      <p>
        People who signed in on the chosen day, in India time. The same person counts once.
        A profile with an ID is listed by that ID and gender. A new registration or a profile that is not
        approved has no profile ID, so that login is listed below by name.
        A day older than 30 days is removed. <Link to="/admin">Back to the office list</Link>.
      </p>
      {error && <div className="error">{error}</div>}
      <label className="login-day">
        Day
        <select value={report?.day || day} onChange={(event) => setDay(event.target.value)}>
          {(report?.days || []).map((item) => (
            <option key={item.day} value={item.day}>{dayLabel(item.day)} · {item.count}</option>
          ))}
        </select>
      </label>
      <div className="dash-genders">
        <div className="dash-cell">
          <strong>{count}</strong>
          {count === 1 ? 'Person' : 'People'}
        </div>
      </div>
      <section className="panel">
        <h2>{report ? dayLabel(report.day) : 'Today'}</h2>
        {!report?.logins?.length ? <p>Nobody with a profile ID logged in on this day.</p> : (
          <LoginRows rows={report.logins} showProfile />
        )}
      </section>
      <section className="panel">
        <h2>No profile ID yet</h2>
        <p>New registration and profiles that are not approved. The name is shown because a profile ID is not assigned.</p>
        {!report?.pending?.length ? <p>Nobody in this group logged in on this day.</p> : (
          <LoginRows rows={report.pending} />
        )}
      </section>
    </div>
  );
}

function LoginRows({ rows, showProfile = false }) {
  return (
    <div className="login-table">
      <table className="admin">
        <thead>
          <tr>
            <th>Time</th>
            {showProfile ? <th>Profile ID</th> : <th>Person</th>}
            {showProfile && <th>Gender</th>}
            <th>Account</th>
            <th>IP address</th>
            <th>Place</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td>{timeLabel(item.at)}</td>
              {showProfile ? <td>{item.profileId}</td> : <td>{item.name}</td>}
              {showProfile && <td>{item.gender || '—'}</td>}
              <td>{item.role}</td>
              <td>{item.ip || '—'}</td>
              <td>{item.place || 'Not available'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
