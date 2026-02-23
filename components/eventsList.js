// components/eventsList.js
import { supabase } from './lib/supabase.js';

function fmtDate(d) {
  try {
    return new Date(d).toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch {
    return String(d ?? '');
  }
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

export function EventsList({ limit = 20 } = {}) {
  const wrap = document.createElement('section');
  wrap.className = 'card';

  const top = document.createElement('div');
  top.className = 'card-top';

  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = 'Upcoming Events';

  const sub = document.createElement('div');
  sub.className = 'card-sub';
  sub.textContent = 'Register for Live Sessions and Panels!';

  top.appendChild(title);
  top.appendChild(sub);

  const body = document.createElement('div');
  body.className = 'card-mid';

  const scroller = document.createElement('div');
  scroller.style.display = 'grid';
  scroller.style.gap = '10px';
  scroller.style.maxHeight = '360px';
  scroller.style.overflow = 'auto';
  scroller.style.paddingRight = '6px';

  const empty = document.createElement('div');
  empty.className = 'empty';
  empty.textContent = 'Loading events…';

  body.appendChild(empty);
  body.appendChild(scroller);

  wrap.appendChild(top);
  wrap.appendChild(body);

  async function load() {
    empty.textContent = 'Loading events…';
    scroller.innerHTML = '';

    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('events')
      .select('id,name,event_date,host,location,details,type,registration_link')
      .gte('event_date', nowIso)
      .order('event_date', { ascending: true })
      .limit(limit);

    if (error) {
      empty.textContent = `Error loading events: ${error.message}`;
      return;
    }

    if (!data || data.length === 0) {
      empty.textContent = 'No upcoming events found.';
      return;
    }

    empty.remove();

    for (const ev of data) {
      const card = document.createElement('article');
      card.className = 'card';
      card.style.margin = '0';

      const t = document.createElement('div');
      t.className = 'card-top';

      const name = document.createElement('div');
      name.className = 'card-title';
      name.textContent = ev.name || 'Event';

      const meta = document.createElement('div');
      meta.className = 'card-sub';
      meta.textContent = `${fmtDate(ev.event_date)} • ${ev.type === 'panel' ? 'Panel' : 'Live Session'}`;

      t.appendChild(name);
      t.appendChild(meta);

      const mid = document.createElement('div');
      mid.className = 'card-mid';

      const details = document.createElement('div');
      details.className = 'kv';
      details.innerHTML = `
        <h4>Details</h4>
        <p>${escapeHtml(ev.details || '—')}</p>
      `;

      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '12px';
      row.style.flexWrap = 'wrap';

      const host = document.createElement('div');
      host.className = 'badge';
      host.textContent = ev.host ? `Host: ${ev.host}` : 'Host: —';

      const loc = document.createElement('div');
      loc.className = 'badge';
      loc.textContent = ev.location ? `Location: ${ev.location}` : 'Location: —';

      row.appendChild(host);
      row.appendChild(loc);

      const actions = document.createElement('div');
      actions.className = 'fav-actions';

      const btn = document.createElement('a');
      btn.className = 'btn';
      btn.textContent = 'RSVP / Register';
      btn.href = ev.registration_link || '#';
      btn.target = '_blank';
      btn.rel = 'noreferrer';

      actions.appendChild(btn);

      mid.appendChild(row);
      mid.appendChild(details);
      mid.appendChild(actions);

      card.appendChild(t);
      card.appendChild(mid);
      scroller.appendChild(card);
    }
  }

  // Public refresh hook (optional)
  wrap.__refresh = load;

  load();
  return wrap;
}
