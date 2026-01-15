import { ScholarshipCard } from './ScholarshipCard.js';

export function ScholarshipGrid({ items, onOpen, onFavoriteChanged }) {
  const wrap = document.createElement('div');

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No scholarships match your filters. Try resetting filters or searching a different keyword.';
    wrap.appendChild(empty);
    return wrap;
  }

  const grid = document.createElement('div');
  grid.className = 'grid';

  items.forEach((item) => {
    grid.appendChild(ScholarshipCard({ item, onOpen, onFavoriteChanged }));
  });

  wrap.appendChild(grid);
  return wrap;
}
