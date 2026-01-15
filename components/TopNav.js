export function TopNav({ active = '#/board', favoritesCount = 0 }) {
  const wrap = document.createElement('div');
  wrap.className = 'topnav';

  const inner = document.createElement('div');
  inner.className = 'topnav-inner';

  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = '#/board';
  brand.innerHTML = `<div class="brand-badge"></div><div>Camp Cat Scholarship Database</div>`;

  const links = document.createElement('div');
  links.className = 'navlinks';

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

  links.appendChild(board);
  links.appendChild(fav);
  links.appendChild(pill);

  inner.appendChild(brand);
  inner.appendChild(links);
  wrap.appendChild(inner);
  return wrap;
}
