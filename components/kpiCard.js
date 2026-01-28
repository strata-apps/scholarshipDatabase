// components/kpiCard.js

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function formatMoney(n) {
  try {
    return `$${Math.round(n).toLocaleString()}`;
  } catch {
    return `$${n}`;
  }
}

function parseMoney(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  // Extract digits from "$1,131,900"
  const n = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function KpiCard({
  title,
  value,
  sub = '',
  animate = true,
  duration = 1200, // ms
} = {}) {
  const card = document.createElement('section');
  card.className = 'card';

  const h = document.createElement('div');
  h.className = 'card-top';

  const t = document.createElement('div');
  t.className = 'card-title';
  t.textContent = title || 'KPI';

  const s = document.createElement('div');
  s.className = 'card-sub';
  s.textContent = sub || '';

  h.appendChild(t);
  h.appendChild(s);

  const mid = document.createElement('div');
  mid.className = 'card-mid';

  const big = document.createElement('div');
  big.style.fontSize = '42px';
  big.style.fontWeight = '900';
  big.textContent = animate ? '$0' : (value ?? '—');

  mid.appendChild(big);
  card.appendChild(h);
  card.appendChild(mid);

  // ---- Animation logic ----
  if (animate) {
    const target = parseMoney(value);
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);

      const current = target * eased;
      big.textContent = formatMoney(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        big.textContent = formatMoney(target); // snap to exact
      }
    }

    requestAnimationFrame(tick);
  }

  return card;
}
