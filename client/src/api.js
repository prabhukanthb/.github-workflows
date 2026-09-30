async function request(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  forgot: (body) => request('/api/auth/forgot-password', { method: 'POST', body }),
  reset: (body) => request('/api/auth/reset-password', { method: 'POST', body }),
  me: (token) => request('/api/auth/me', { token }),
  changePassword: (body, token) => request('/api/auth/change-password', { method: 'POST', body, token }),
  myProfile: (token) => request('/api/profiles/me', { token }),
  saveProfile: (body, token) => request('/api/profiles/me', { method: 'PUT', body, token }),
  browse: (token, params) => request(`/api/profiles/browse?${params}`, { token }),
  interests: (token) => request('/api/interests', { token }),
  sendInterest: (profileId, token) => request('/api/interests', { method: 'POST', body: { profileId }, token }),
  respondInterest: (id, status, token) => request(`/api/interests/${id}/respond`, { method: 'POST', body: { status }, token }),
  adminSummary: (token) => request('/api/admin/summary', { token }),
  adminProfiles: (token) => request('/api/admin/profiles', { token }),
  adminCreate: (body, token) => request('/api/admin/profiles', { method: 'POST', body, token }),
  adminUpdate: (id, body, token) => request(`/api/admin/profiles/${id}`, { method: 'PATCH', body, token }),
  profile: (id, token) => request(`/api/profiles/${id}`, { token }),
  adminStaff: (token) => request('/api/admin/staff', { token }),
  adminCreateStaff: (body, token) => request('/api/admin/staff', { method: 'POST', body, token }),
  uploadPhoto: (dataUrl, token) => request('/api/uploads', { method: 'POST', body: { dataUrl }, token })
};
