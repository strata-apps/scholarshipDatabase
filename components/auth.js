// components/auth.js
import { supabase } from './lib/supabase.js';

const LS_KEY = 'sb_scholarshipdb_session_v1';

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || 'null');
  } catch {
    return null;
  }
}

export function isAuthed() {
  const s = getSession();
  return !!(s && s.user && s.access_token);
}

export async function setSessionFromSupabase() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[auth] getSession error:', error.message);
  }
  const session = data?.session ?? null;
  localStorage.setItem(LS_KEY, JSON.stringify(session));
  return session;
}

export async function clearSession() {
  // Clears locally + signs out remotely
  localStorage.removeItem(LS_KEY);
  const { error } = await supabase.auth.signOut();
  if (error) console.warn('[auth] signOut error:', error.message);
}

export function onAuthChange(callback) {
  // Keep localStorage in sync if a refresh/login/logout happens
  return supabase.auth.onAuthStateChange((_event, session) => {
    localStorage.setItem(LS_KEY, JSON.stringify(session ?? null));
    callback?.(session ?? null);
  });
}

// ---- Legacy local-user helpers (optional) ----
// If other parts of your app still import these, keep them as no-ops
export function getLocalUsers() { return []; }
export function setLocalUsers() {}
export function setSession() {} // not used anymore
