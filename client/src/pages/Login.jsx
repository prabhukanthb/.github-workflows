import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(emailOrPhone, password);
      navigate(user.role === 'admin' || user.role === 'subadmin' ? '/admin' : '/profile');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="panel auth-card" onSubmit={submit}>
        <div className="kicker">Telugu Kalyanamala</div>
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <label htmlFor="login-id">Email or phone</label>
        <input id="login-id" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} autoComplete="username" required />
        <label htmlFor="login-password">Password</label>
        <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        <button className="btn-maroon" style={{ width: '100%', marginTop: 16 }} disabled={loading} type="submit">
          {loading ? 'Logging in…' : 'Login'}
        </button>
        <p><Link to="/forgot-password">Forgot password?</Link></p>
        <p><Link to="/register">Register here</Link></p>
        {import.meta.env.DEV && (
          <div className="notice">
            Demo office: admin@example.com / Office@12345
            <br />
            Demo bride: anitha.demo@example.com / Member@12345
          </div>
        )}
      </form>
    </div>
  );
}
