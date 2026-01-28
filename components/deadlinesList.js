// components/deadlinesList.js
function tryParseDate(s) {
  if (!s) return null;

  const t = Date.parse(s);
  if (Number.isFinite(t)) return new Date(t);

  const m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const mm = Number(m[1]), dd = Number(m[2]), yy = Number(m[3]);
    const d = new Date(yy, mm - 1, dd);
    return Number.isFinite(d.getTime()) ? d : null;
  }

  return null;
}

export function DeadlinesWithinWeek({
  scholarships = [],
  parseAmountToNumber,
  maxItems = 30,
  maxHeight = 360,
} = {}) {
  const wrap = document.createElement('section');
  wrap.className = 'card';

  const top = document.createElement('div');
  top.className = 'card-top';

  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = 'Schoarships that Close Soon!';

  const sub = document.createElement('div');
  sub.className = 'card-sub';
  sub.textContent = '';

  top.appendChild(title);
  top.appendChild(sub);

  const body = document.createElement('div');
  body.className = 'card-mid';

  // ✅ Scroll container
  const scroller = document.createElement('div');
  scroller.className = 'dashboard-scroll';
  scroller.style.maxHeight = `${maxHeight}px`;
  scroller.style.overflow = 'auto';
  scroller.style.display = 'grid';
  scroller.style.gap = '10px';
  scroller.style.paddingRight = '6px';

  const empty = document.createElement('div');
  empty.className = 'empty';

  body.appendChild(scroller);
  body.appendChild(empty);

  wrap.appendChild(top);
  wrap.appendChild(body);

  const now = new Date();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const items = scholarships
    .map((s) => ({ s, d: tryParseDate(s.closeDate) }))
    .filter(({ d }) => d && d >= now && d <= end)
    .sort((a, b) => a.d - b.d)
    .slice(0, maxItems);

  if (!items.length) {
    empty.textContent = 'No deadlines in the next 7 days.';
    return wrap;
  }

  empty.remove();

  for (const { s, d } of items) {
    const row = document.createElement('article');
    row.className = 'card';
    row.style.margin = '0';

    const t = document.createElement('div');
    t.className = 'card-top';

    const name = document.createElement('div');
    name.className = 'card-title';
    name.textContent = s.name || 'Scholarship';

    const meta = document.createElement('div');
    meta.className = 'card-sub';
    meta.textContent = `Closes ${d.toLocaleDateString()}`;

    t.appendChild(name);
    t.appendChild(meta);

    const mid = document.createElement('div');
    mid.className = 'card-mid';

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = s.amount ? `Amount: ${s.amount}` : 'Amount: —';

    const actions = document.createElement('div');
    actions.className = 'fav-actions';

    const link = document.createElement('a');
    link.className = 'btn secondary';
    link.textContent = 'Open';
    link.href = s.url || '#';
    link.target = '_blank';
    link.rel = 'noreferrer';

    actions.appendChild(link);

    mid.appendChild(badge);
    mid.appendChild(actions);

    row.appendChild(t);
    row.appendChild(mid);

    scroller.appendChild(row);
  }

  return wrap;
}
