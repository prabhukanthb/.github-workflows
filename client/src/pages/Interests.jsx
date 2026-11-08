import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { fullName } from '../siteConfig';

function sentOn(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });
}

export default function Interests() {
  const { token, isAuthenticated, loading, user } = useAuth();
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false);

  const load = () => {
    if (!token) return;
    api.interests(token)
      .then((data) => {
        setInterests(data.interests || []);
        setReady(true);
      })
      .catch((err) => {
        setError(err.message);
        setReady(true);
      });
  };

  useEffect(() => {
    load();
  }, [token]);

  if (loading) return <div className="page">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin' || user?.role === 'subadmin') return <Navigate to="/admin/interests" replace />;

  const respond = async (id, next) => {
    setError('');
    try {
      const data = await api.respondInterest(id, next, token);
      setMessage(data.message);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="kicker">Telugu Kalyanamala</div>
      <h2>Interest notifications</h2>
      <p>Interests you send or receive stay here for 7 days, then they are removed. <Link to="/profile">Back to my biodata</Link></p>
      {error && <div className="error">{error}</div>}
      {message && <div className="ok">{message}</div>}
      {!ready && <p>Loading notifications…</p>}
      {ready && interests.length === 0 && <p>No interest notifications.</p>}
      <div className="profile-grid">
        {interests.map((item) => (
          <article key={item.id} className="why-card">
            <h3>{fullName(item.profile) || item.fromName}</h3>
            <p>{item.incoming ? 'Received' : 'Sent'} · {item.status}{item.createdAt ? ` · ${sentOn(item.createdAt)} IST` : ''}</p>
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

export function OfficeInterests() {
  const { token, user, isAuthenticated, loading } = useAuth();
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

  useEffect(() => {
    if (!token || !isAdmin) return undefined;
    let active = true;
    api.adminInterests(token)
      .then((data) => {
        if (!active) return;
        setInterests(data.interests || []);
        setReady(true);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [token, isAdmin]);

  if (loading) return <div className="page">Loading…</div>;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="page">
      <div className="kicker">Vijayawada office</div>
      <h2>Interest notifications</h2>
      <p>When a member taps Express interest, it appears here. There is no separate email or text message. Call the numbers below and keep them private until both families agree. Each notification is removed after 7 days. <Link to="/admin">Back to the office list</Link></p>
      {error && <div className="error">{error}</div>}
      {!ready && <p>Loading notifications…</p>}
      {ready && interests.length === 0 && <p>No interest notifications.</p>}
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
              {item.createdAt ? ` · ${sentOn(item.createdAt)} IST` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
