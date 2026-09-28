import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestCode = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = await api.forgot({ emailOrPhone });
      setMessage(data.message);
      if (data.resetToken) setToken(data.resetToken);
    } catch (err) {
      setError(err.message);
    }
  };

  const reset = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await api.reset({ token, password });
      setMessage(data.message);
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="panel auth-card">
        <div className="kicker">New Kalyanamala</div>
        <h2>Reset password</h2>
        {error && <div className="error">{error}</div>}
        {message && <div className="ok">{message}</div>}
        <form onSubmit={requestCode}>
          <label htmlFor="forgot-id">Email or phone</label>
          <input id="forgot-id" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} required />
          <button className="btn-maroon" style={{ marginTop: 14 }} type="submit">Get reset code</button>
        </form>
        <form onSubmit={reset}>
          <label htmlFor="reset-token">Reset code</label>
          <input id="reset-token" value={token} onChange={(e) => setToken(e.target.value)} required />
          <label htmlFor="reset-password">New password</label>
          <input id="reset-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn-gold" style={{ marginTop: 14 }} type="submit">Save new password</button>
        </form>
        <p><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
}
