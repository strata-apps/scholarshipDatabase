// app.js
import { TopNav } from './components/TopNav.js';
import { loadScholarships } from './screens/board.js';
import { renderFavoritesScreen } from './screens/favorites.js';
import { getFavorites } from './components/storage.js';

const app = document.getElementById('app');

let scholarshipsCache = null;

/* ------------------------------
   Filters drawer “chrome”
   - overlay click closes
   - ESC closes
   - mobile button opens
--------------------------------*/
function ensureFiltersChrome() {
  // Overlay (click to close)
  if (!document.querySelector('.filters-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'filters-overlay';
    overlay.addEventListener('click', () => {
      document.body.classList.remove('filters-open');
    });
    document.body.appendChild(overlay);
  }

  // ESC closes
  if (!window.__filtersEscBound) {
    window.__filtersEscBound = true;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') document.body.classList.remove('filters-open');
    });
  }

  // Mobile "Filters" button (only visually appears on small screens via CSS)
  if (!document.querySelector('.filters-toggle')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn secondary filters-toggle';
    btn.textContent = 'Filters';
    btn.setAttribute('aria-label', 'Open filters');

    btn.addEventListener('click', () => {
      document.body.classList.add('filters-open');
    });

    // Put it in the body so it persists across route rerenders
    // If you'd rather place it in the toolbar, we can move it later.
    document.body.appendChild(btn);
  }
}

async function ensureData() {
  if (scholarshipsCache) return scholarshipsCache;
  const res = await fetch('./data/scholarships.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load data/scholarships.json');
  const data = await res.json();
  scholarshipsCache = data;
  return scholarshipsCache;
}

function route() {
  const hash = window.location.hash || '#/board';
  const base = hash.split('?')[0];

  // Make sure mobile drawer helpers exist once
  ensureFiltersChrome();

  // Any route change should close the drawer (feels natural on mobile)
  document.body.classList.remove('filters-open');

  app.innerHTML = '';
  app.appendChild(
    TopNav({
      active: base,
      favoritesCount: getFavorites().length,
    })
  );

  const shell = document.createElement('div');
  shell.className = 'shell';
  app.appendChild(shell);

  const mount = document.createElement('div');
  shell.appendChild(mount);

  (async () => {
    const scholarships = await ensureData();
    if (base === '#/favorites') {
      renderFavoritesScreen(mount, scholarships, () => route());
    } else {
      // default board
      loadScholarships(mount, scholarships, () => route());
    }
  })().catch((e) => {
    mount.innerHTML = `<div class="page"><div class="empty">Error: ${e.message}</div></div>`;
  });
}

window.addEventListener('hashchange', route);
window.addEventListener('storage', route); // if multiple tabs
route();
