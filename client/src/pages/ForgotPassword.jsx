import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const requestCode = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setPassword('');
    try {
      const data = await api.forgot({ emailOrPhone });
      setPassword(data.temporaryPassword || '');
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="panel auth-card">
        <div className="kicker">Telugu Kalyanamala</div>
        <h2>Reset password</h2>
        <p>Enter the registered email or mobile. The password becomes the first 4 letters of the Full Name, then @, then the last 4 digits of the registered mobile. Full Name Prabhu and mobile 9876543210 becomes Prab@3210.</p>
        {error && <div className="error">{error}</div>}
        {password && (
          <div className="ok">
            Your password is now <strong>{password}</strong>. Use it on the login page.
          </div>
        )}
        {!password && message && <div className="ok">{message}</div>}
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
