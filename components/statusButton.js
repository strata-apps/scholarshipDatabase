// components/statusButton.js
import { getStatusMap, setStatusMap } from './progressCheck.js';

const OPTIONS = ['Applied', 'Received', 'Denied'];

export function getStatusForId(id) {
  const map = getStatusMap();
  return map[id] || 'Applied';
}

export function setStatusForId(id, status) {
  const map = getStatusMap();
  map[id] = status;
  setStatusMap(map);
}

/**
 * StatusButton
 * @param {Object} args
 * @param {string} args.id - scholarship id
 * @param {Function} args.onChange - (newStatus) => void
 */
export function StatusButton({ id, onChange } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'sb';

  const sel = document.createElement('select');
  sel.className = 'sb-select';

  for (const opt of OPTIONS) {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    sel.appendChild(o);
  }

  sel.value = getStatusForId(id);

  const applyTheme = () => {
    wrap.classList.remove('sb--applied', 'sb--received', 'sb--denied');
    if (sel.value === 'Received') wrap.classList.add('sb--received');
    else if (sel.value === 'Denied') wrap.classList.add('sb--denied');
    else wrap.classList.add('sb--applied');
  };

  sel.addEventListener('change', () => {
    setStatusForId(id, sel.value);
    applyTheme();
    onChange?.(sel.value);
  });

  wrap.appendChild(sel);
  applyTheme();
  return wrap;
}
