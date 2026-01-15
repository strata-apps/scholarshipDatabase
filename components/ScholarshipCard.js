import { Badge } from './Badge.js';
import { isFavorited, toggleFavorite } from './storage.js';
import { formatDate, daysUntil } from './format.js';

export function ScholarshipCard({ item, onOpen, onFavoriteChanged }) {
  const card = document.createElement('div');
  card.className = 'card';

  const top = document.createElement('div');
  top.className = 'card-top';

  const logo = document.createElement('div');
  logo.className = 'logo';
  logo.textContent = '🎓';

  const meta = document.createElement('div');
  meta.style.minWidth = '0';

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = item.name;

  const sub = document.createElement('p');
  sub.className = 'card-sub';

  const openOn = item.openDate ? formatDate(item.openDate) : '—';
  const closeOn = item.closeDate ? formatDate(item.closeDate) : '—';

  const dueIn = daysUntil(item.closeDate);
  const dueText =
    dueIn === null
      ? `Closes: ${closeOn}`
      : (dueIn >= 0
          ? `Closes in ${dueIn} day(s)`
          : `Closed ${Math.abs(dueIn)} day(s) ago`);

  sub.textContent = `${item.region || '—'} • Opens: ${openOn} • ${dueText}`;


  meta.appendChild(title);
  meta.appendChild(sub);

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const heartBtn = document.createElement('button');
  heartBtn.className = 'iconbtn';
  const setHeart = () => {
    const on = isFavorited(item.id);
    heartBtn.innerHTML = `<span class="heart ${on ? 'on' : ''}">${on ? '❤️' : '🤍'}</span>`;
    heartBtn.title = on ? 'Remove from favorites' : 'Add to favorites';
  };
  setHeart();

  heartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(item.id);
    setHeart();
    onFavoriteChanged?.();
  });

  actions.appendChild(heartBtn);

  //top.appendChild(logo);
  top.appendChild(meta);
  top.appendChild(actions);

  const mid = document.createElement('div');
  mid.className = 'card-mid';

  mid.appendChild(Badge(item.amount || 'Amount: —'));
  if (item.gpaMin != null) mid.appendChild(Badge(`GPA ≥ ${item.gpaMin}`));
  if (item.needBased) mid.appendChild(Badge('Need-based'));
  if (Array.isArray(item.citizenship) && item.citizenship.length) {
    mid.appendChild(Badge(item.citizenship[0]));
  }

  // tags (max 2)
  (item.tags || []).slice(0, 2).forEach((t) => mid.appendChild(Badge(t)));

  const bottom = document.createElement('div');
  bottom.className = 'card-bottom';

  const openBtn = document.createElement('button');
  openBtn.className = 'btn';
  openBtn.textContent = 'View Details';
  openBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onOpen(item);
  });

  const applyBtn = document.createElement('a');
  applyBtn.className = 'btn secondary';
  applyBtn.textContent = 'Apply';
  applyBtn.href = item.url || '#';
  applyBtn.target = '_blank';
  applyBtn.rel = 'noreferrer';

  bottom.appendChild(openBtn);
  bottom.appendChild(applyBtn);

  card.appendChild(top);
  card.appendChild(mid);
  card.appendChild(bottom);

  card.addEventListener('click', () => onOpen(item));
  return card;
}
