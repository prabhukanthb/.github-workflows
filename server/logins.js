export const LOGIN_KEEP_DAYS = 30;
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function istDayKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  const month = String(ist.getUTCMonth() + 1).padStart(2, '0');
  const day = String(ist.getUTCDate()).padStart(2, '0');
  return `${ist.getUTCFullYear()}-${month}-${day}`;
}

export function startOfIstDay(value) {
  const key = istDayKey(value);
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day) - IST_OFFSET_MS);
}

export function loginCutoff(now = new Date()) {
  return new Date(startOfIstDay(now).getTime() - (LOGIN_KEEP_DAYS - 1) * DAY_MS);
}

export function pruneLogins(logins, now = new Date()) {
  const cutoff = loginCutoff(now).getTime();
  return (logins || []).filter((item) => {
    const at = Date.parse(item?.at || '');
    return Number.isFinite(at) && at >= cutoff;
  });
}

export function withPrunedLogins(state, now = new Date()) {
  const logins = pruneLogins(state?.logins, now);
  const current = state?.logins || [];
  if (logins.length === current.length) return state;
  return { ...state, logins };
}

export function recordLogin(state, event, now = new Date()) {
  return {
    ...state,
    logins: pruneLogins([...(state?.logins || []), event], now)
  };
}

export function recentDayKeys(now = new Date()) {
  const start = startOfIstDay(now);
  return Array.from({ length: LOGIN_KEEP_DAYS }, (_, index) => istDayKey(new Date(start.getTime() - index * DAY_MS)));
}

export function personName(user) {
  if (!user) return 'Removed account';
  return [user.firstName, user.surname || user.lastName].filter(Boolean).join(' ') || 'Member';
}

export function loginReport(state, day, users = [], now = new Date()) {
  const logins = pruneLogins(state?.logins, now);
  const wanted = recentDayKeys(now).includes(day) ? day : istDayKey(now);
  const days = recentDayKeys(now).map((key) => ({
    day: key,
    count: new Set(logins.filter((item) => istDayKey(item.at) === key).map((item) => item.userId)).size
  }));
  const rows = logins
    .filter((item) => istDayKey(item.at) === wanted)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .map((item) => {
      const user = users.find((person) => person.id === item.userId);
      const role = user?.role === 'admin' || user?.role === 'subadmin' ? 'Office' : 'Member';
      return {
        id: item.id,
        at: item.at,
        name: personName(user),
        role: user ? role : 'Member',
        ip: item.ip || '',
        place: item.place || 'Not available'
      };
    });
  return {
    day: wanted,
    count: new Set(logins.filter((item) => istDayKey(item.at) === wanted).map((item) => item.userId)).size,
    days,
    logins: rows
  };
}

export function clientIp(req) {
  const raw = req?.ip || req?.socket?.remoteAddress || '';
  const text = String(raw).replace(/^::ffff:/, '').trim();
  return text || 'unknown';
}

export function isLocalIp(ip) {
  const text = String(ip || '').toLowerCase();
  if (text === 'unknown' || text === '::1' || text === '0.0.0.0') return true;
  if (text.startsWith('127.') || text.startsWith('10.') || text.startsWith('192.168.')) return true;
  if (text.startsWith('fe80:') || text.startsWith('fc') || text.startsWith('fd')) return true;
  const parts = text.split('.').map(Number);
  if (parts.length === 4 && parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  return false;
}

export async function placeForIp(ip, fetchImpl = fetch) {
  if (isLocalIp(ip)) return 'This network';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1200);
  try {
    const response = await fetchImpl(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: controller.signal });
    if (!response.ok) return 'Not available';
    const data = await response.json();
    if (!data?.success) return 'Not available';
    const place = [data.city, data.region, data.country].filter(Boolean).join(', ');
    return place || 'Not available';
  } catch {
    return 'Not available';
  } finally {
    clearTimeout(timer);
  }
}
