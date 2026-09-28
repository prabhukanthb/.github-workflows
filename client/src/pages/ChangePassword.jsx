import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function ChangePassword() {
  const { token, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (loading) return <div className="page">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = await api.changePassword(form, token);
      setMessage(data.message);
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="panel auth-card" onSubmit={submit}>
        <div className="kicker">New Kalyanamala</div>
        <h2>Change password</h2>
        {error && <div className="error">{error}</div>}
        {message && <div className="ok">{message}</div>}
        <label htmlFor="current-password">Current password</label>
        <input id="current-password" type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
        <label htmlFor="new-password">New password</label>
        <input id="new-password" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
        <button className="btn-maroon" style={{ marginTop: 16 }} type="submit">Update password</button>
      </form>
    </div>
  );
}
