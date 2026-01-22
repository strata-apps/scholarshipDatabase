// components/auth.js
const SESSION_KEY = 'scholarshipdb_session_v1';
const USERS_KEY = 'scholarshipdb_users_v1';

// ---- Session helpers ----
export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

export function isAuthed() {
  return !!getSession();
}

export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ---- Local "user registry" (dev-only, for static hosting) ----
export function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}

export function setLocalUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
