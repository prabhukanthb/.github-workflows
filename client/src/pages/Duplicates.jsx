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
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}

function GroupList({ groups, empty }) {
  if (!groups?.length) return <p>{empty}</p>;
  return (
    <ul className="interest-list">
      {groups.map((group) => (
        <li key={`${group.reason}-${group.key}`}>
          <strong>{group.reason}</strong>
          {group.reason === 'Same phone' || group.reason === 'Same email' ? ` · ${group.key}` : ''}
          {': '}
          {(group.profiles || []).map((profile) => `${profile.name} (${profile.profileId || 'no ID'})`).join('; ')}
        </li>
      ))}
    </ul>
  );
}

export default function Duplicates() {
  const { token, user, isAuthenticated, loading } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';
  const [report, setReport] = useState(null);
  const [day, setDay] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !isAdmin) return undefined;
    let active = true;
    api.adminDuplicates(token, day)
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
  const savedAt = report?.recordedAt ? timeLabel(report.recordedAt) : '';
  return (
    <div className="page dash-board">
      <div className="kicker">Vijayawada office</div>
      <h2>Duplicate entries</h2>
      <p>
        Profiles that share a phone, an email, or the same name and date of birth.
        Today’s list is saved when this page is opened and when a biodata is added, edited, or removed.
        Choose an earlier day to see that day’s list. A day older than 30 days is removed.
        {' '}<Link to="/admin">Back to the office list</Link>.
      </p>
      {error && <div className="error">{error}</div>}
      <label className="login-day">
        Day
        <select value={report?.day || day} onChange={(event) => setDay(event.target.value)}>
          {(report?.days || []).map((item) => (
            <option key={item.day} value={item.day}>
              {dayLabel(item.day)} · {item.saved ? item.count : 'not saved'}
            </option>
          ))}
        </select>
      </label>
      <div className="dash-genders">
        <div className="dash-cell">
          <strong>{count}</strong>
          {count === 1 ? 'Group' : 'Groups'}
        </div>
      </div>
      <section className="panel">
        <h2>{report ? dayLabel(report.day) : 'Today'}</h2>
        {report?.saved && savedAt ? <p>Saved at {savedAt} IST.</p> : null}
        {!report?.saved ? (
          <p>No duplicate check was saved on this day.</p>
        ) : (
          <GroupList groups={report.groups} empty="No duplicate phone, email, or same name and date of birth." />
        )}
      </section>
      <section className="panel">
        <h2>Changes since the previous saved day</h2>
        {!report?.comparedWith ? <p>There is no earlier day to compare yet.</p> : (
          <>
            <p>Compared with {dayLabel(report.comparedWith)}.</p>
            <h3>New</h3>
            <GroupList groups={report.added} empty="No new duplicates." />
            <h3>No longer duplicated</h3>
            <GroupList groups={report.cleared} empty="None were cleared." />
          </>
        )}
      </section>
    </div>
  );
}
