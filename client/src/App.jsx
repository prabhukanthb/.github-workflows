import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import Browse from './pages/Browse';
import Profile from './pages/Profile';
import Admin, { CreateProfile } from './pages/Admin';
import { Privacy, Refund, Terms } from './pages/Legal';
import { useAuth } from './AuthContext';

function Shell() {
  const { loading } = useAuth();
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="site-main">
        {loading ? <div className="page">Loading…</div> : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/create" element={<CreateProfile />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

export default function App() {
  return <Shell />;
}
