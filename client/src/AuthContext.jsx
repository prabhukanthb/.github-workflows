import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('tk_token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('tk_token')));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return undefined;
    }
    let active = true;
    api.me(token)
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('tk_token');
        if (active) {
          setToken('');
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: Boolean(token && user),
    async login(emailOrPhone, password) {
      const data = await api.login({ emailOrPhone, password });
      localStorage.setItem('tk_token', data.token);
      setUser(data.user);
      setToken(data.token);
      return data.user;
    },
    async register(payload) {
      const data = await api.register(payload);
      localStorage.setItem('tk_token', data.token);
      setUser(data.user);
      setToken(data.token);
      return data.user;
    },
    logout() {
      localStorage.removeItem('tk_token');
      setToken('');
      setUser(null);
    }
  }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
