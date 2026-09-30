import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState('');
  const [error, setError] = useState('');

  const requestCode = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setHint('');
    try {
      const data = await api.forgot({ emailOrPhone });
      setMessage(data.message);
      setHint(data.passwordHint || '');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="panel auth-card">
        <div className="kicker">Telugu Kalyanamala</div>
        <h2>Reset password</h2>
        <p>Enter the registered email or mobile. The password becomes the first 4 letters of the first name, then @, then the last 4 digits of that mobile.</p>
        {error && <div className="error">{error}</div>}
        {message && <div className="ok">{message}{hint ? ` Format: ${hint}.` : ''}</div>}
        <form onSubmit={requestCode}>
          <label htmlFor="forgot-id">Email or phone</label>
          <input id="forgot-id" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} required />
          <button className="btn-maroon" style={{ marginTop: 14 }} type="submit">Reset password</button>
        </form>
        <p><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
}
