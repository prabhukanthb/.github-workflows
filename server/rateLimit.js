import { phoneDigits } from './passwords.js';

export const AUTH_WINDOW_MS = 15 * 60 * 1000;
export const AUTH_MAX_ATTEMPTS = 3;
export const LOGIN_FAILURE = 'Email, phone or password is incorrect.';

export function normalizeAccount(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  if (raw.includes('@')) return raw;
  return phoneDigits(raw) || raw;
}

export function createLimiter({ windowMs = AUTH_WINDOW_MS, max = AUTH_MAX_ATTEMPTS } = {}) {
  const buckets = new Map();

  function fresh(key, now) {
    return (buckets.get(key) || []).filter((ts) => now - ts < windowMs);
  }

  function attempt(keys, now = Date.now()) {
    const names = [...new Set(keys.filter(Boolean))];
    const states = names.map((key) => ({ key, hits: fresh(key, now) }));
    const blocked = states.find((state) => state.hits.length >= max);
    if (blocked) {
      for (const state of states) {
        if (state.hits.length) buckets.set(state.key, state.hits);
        else buckets.delete(state.key);
      }
      return {
        limited: true,
        retryAfterMs: Math.max(0, windowMs - (now - blocked.hits[0]))
      };
    }
    for (const state of states) buckets.set(state.key, [...state.hits, now]);
    return { limited: false, retryAfterMs: 0 };
  }

  return { attempt };
}

const authLimiter = createLimiter();

export function limitAuth(route, accountsFrom) {
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const keys = [`ip:${route}:${ip}`];
    for (const value of accountsFrom(req) || []) {
      const account = normalizeAccount(value);
      if (account) keys.push(`acct:${route}:${account}`);
    }
    const result = authLimiter.attempt(keys);
    if (!result.limited) return next();
    res.set('Retry-After', String(Math.max(1, Math.ceil(result.retryAfterMs / 1000))));
    return res.status(429).json({ message: 'Too many attempts. Try again in 15 minutes.' });
  };
}
