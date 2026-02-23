export function TopNav({ active = '#/board', favoritesCount = 0, onLogout }) {
  const wrap = document.createElement('div');
  wrap.className = 'topnav';

  const inner = document.createElement('div');
  inner.className = 'topnav-inner';

  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = '#/board';
  brand.innerHTML = `
    <img src="/components/assets/logo/logo.png" alt="Camp Catanese Logo" class="brand-logo" />
    <div>Camp Catanese Scholarship Database</div>
  `;


  const right = document.createElement('div');
  right.className = 'topnav-right';

  const links = document.createElement('div');
  links.className = 'navlinks';

  const dash = document.createElement('a');
  dash.className = 'navlink' + (active === '#/dashboard' ? ' active' : '');
  dash.href = '#/dashboard';
  dash.textContent = 'Dashboard';

  const board = document.createElement('a');
  board.className = 'navlink' + (active === '#/board' ? ' active' : '');
  board.href = '#/board';
  board.textContent = 'Board';

  const fav = document.createElement('a');
  fav.className = 'navlink' + (active === '#/favorites' ? ' active' : '');
  fav.href = '#/favorites';
  fav.textContent = 'Favorites';

  const pill = document.createElement('div');
  pill.className = 'pill';
  pill.innerHTML = `❤️ <span>${favoritesCount}</span> <small>saved</small>`;

  links.appendChild(dash);
  links.appendChild(board);
  links.appendChild(fav);
  links.appendChild(pill);

  right.appendChild(links);

  // Logout button
  if (typeof onLogout === 'function') {
    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.className = 'btn secondary logout-btn';
    logoutBtn.textContent = 'Log out';
    logoutBtn.addEventListener('click', onLogout);
    right.appendChild(logoutBtn);
  }

  inner.appendChild(brand);
  inner.appendChild(right);
  wrap.appendChild(inner);
  return wrap;
}
