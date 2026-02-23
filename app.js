// app.js
import { TopNav } from './components/TopNav.js';
import { loadScholarships } from './screens/board.js';
import { renderFavoritesScreen } from './screens/favorites.js';
import { getFavorites } from './components/storage.js';

import renderLoginScreen from './screens/login.js';
import { isAuthed, getSession, clearSession, onAuthChange, setSessionFromSupabase } from './components/auth.js';

import { renderDashboardScreen } from './screens/dashboard.js';

import { supabase } from './components/lib/supabase.js';




const app = document.getElementById('app');

await setSessionFromSupabase(); // prime local cache on load
onAuthChange(() => route());    // reroute on login/logout/refresh

let scholarshipsCache = null;


/* ------------------------------
   Filters drawer “chrome”
--------------------------------*/
function ensureFiltersChrome() {
  if (!document.querySelector('.filters-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'filters-overlay';
    overlay.addEventListener('click', () => {
      document.body.classList.remove('filters-open');
    });
    document.body.appendChild(overlay);
  }

  if (!window.__filtersEscBound) {
    window.__filtersEscBound = true;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') document.body.classList.remove('filters-open');
    });
  }

  if (!document.querySelector('.filters-toggle')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn secondary filters-toggle';
    btn.textContent = 'Filters';
    btn.setAttribute('aria-label', 'Open filters');
    btn.addEventListener('click', () => document.body.classList.add('filters-open'));
    document.body.appendChild(btn);
  }
}

async function ensureData(force = false) {
  if (scholarshipsCache && !force) return scholarshipsCache;

  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .order('close_date', { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);

  // Map DB rows (snake_case) -> UI shape (camelCase)
  scholarshipsCache = (data || []).map((r) => ({
    id: r.id,
    name: r.name,
    amount: r.amount,

    openDate: r.open_date,
    closeDate: r.close_date,
    gpaMin: r.gpa_min,

    citizenship: r.citizenship ?? [],
    needBased: r.need_based,
    grant: r.is_grant,

    region: r.region,
    requirements: r.requirements,
    url: r.url,
    tags: r.tags ?? [],
  }));

  return scholarshipsCache;
}



function safeRedirect(hash) {
  if (window.location.hash !== hash) window.location.hash = hash;
}

function route() {
  const hash = window.location.hash || '#/login';
  const base = hash.split('?')[0];

  ensureFiltersChrome();
  document.body.classList.remove('filters-open');

  // ---- Auth gating ----
  const authed = isAuthed();

  // If not authed, only allow login route
  if (!authed && base !== '#/login') {
    safeRedirect('#/login');
    return;
  }

  // If authed and they go to login, send them to board
  if (authed && base === '#/login') {
    safeRedirect('#/dashboard');
    return;
  }

  app.innerHTML = '';

  // Only show TopNav when signed in
  if (authed) {
    app.appendChild(
      TopNav({
        active: base,
        favoritesCount: getFavorites().length,
        // OPTIONAL: if your TopNav supports extra actions later
        user: getSession(),
        onLogout: () => {
          clearSession();
          safeRedirect('#/login');
        },
      })
    );
  }

  const shell = document.createElement('div');
  shell.className = 'shell';
  app.appendChild(shell);

  const mount = document.createElement('div');
  shell.appendChild(mount);

  (async () => {
    if (base === '#/login') {
      renderLoginScreen(mount, () => safeRedirect('#/dashboard'));
      return;
    }

    const scholarships = await ensureData();

    if (base === '#/dashboard') {
      renderDashboardScreen(mount, scholarships, () => route());
    } else if (base === '#/favorites') {
      renderFavoritesScreen(mount, scholarships, () => route());
    } else {
      loadScholarships(mount, scholarships, () => route());
    }
  })().catch((e) => {
    mount.innerHTML = `<div class="page"><div class="empty">Error: ${e.message}</div></div>`;
  });
}

window.addEventListener('hashchange', route);
window.addEventListener('storage', route);
route();
