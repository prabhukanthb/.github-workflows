import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { REGISTRATION_FEE } from '../siteConfig';

const empty = {
  email: '',
  phone: '',
  alternativePhone: '',
  firstName: '',
  surname: '',
  password: '',
  confirmPassword: ''
};

export default function Register() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const set = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const digits = (name, value) => set(name, value.replace(/\D/g, '').slice(0, 10));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, lastName: form.surname });
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="panel auth-card" onSubmit={submit}>
        <div className="kicker">New Kalyanamala</div>
        <h2>Register</h2>
        <p>Registration is {REGISTRATION_FEE}. Parents may create the login in the candidate’s name. Payment is collected by the Vijayawada office.</p>
        {error && <div className="error">{error}</div>}
        <label htmlFor="reg-email">Email</label>
        <input id="reg-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
        <label htmlFor="reg-phone">Phone</label>
        <input id="reg-phone" inputMode="numeric" value={form.phone} onChange={(e) => digits('phone', e.target.value)} required />
        <label htmlFor="reg-alt">Alternate mobile (optional)</label>
        <input id="reg-alt" inputMode="numeric" value={form.alternativePhone} onChange={(e) => digits('alternativePhone', e.target.value)} />
        <label htmlFor="reg-first">First name</label>
        <input id="reg-first" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required />
        <label htmlFor="reg-surname">Surname</label>
        <input id="reg-surname" value={form.surname} onChange={(e) => set('surname', e.target.value)} required />
        <label htmlFor="reg-password">Password</label>
        <input id="reg-password" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" required />
        <label htmlFor="reg-confirm">Confirm password</label>
        <input id="reg-confirm" type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} autoComplete="new-password" required />
        <button className="btn-maroon" style={{ width: '100%', marginTop: 16 }} disabled={loading} type="submit">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
        <p>Already registered? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
