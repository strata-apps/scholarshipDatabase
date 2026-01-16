// components/progressCheck.js

const LS_GOAL_KEY = 'scholarship_goal_amount';
const LS_STATUS_KEY = 'scholarship_fav_status_by_id';

export function getGoalValue() {
  const raw = localStorage.getItem(LS_GOAL_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function setGoalValue(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) {
    localStorage.removeItem(LS_GOAL_KEY);
    return;
  }
  localStorage.setItem(LS_GOAL_KEY, String(Math.round(v)));
}

export function getStatusMap() {
  try {
    const raw = localStorage.getItem(LS_STATUS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

export function setStatusMap(map) {
  localStorage.setItem(LS_STATUS_KEY, JSON.stringify(map || {}));
}

export function parseAmountToNumber(amount) {
  // Returns a numeric value or null if not parseable.
  // Strategy: extract all numbers; if a range exists, use the MAX number.
  const s = String(amount ?? '').trim();
  if (!s) return null;

  const nums = s.match(/(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?/g);
  if (!nums || !nums.length) return null;

  const values = nums
    .map((x) => Number(String(x).replace(/,/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (!values.length) return null;
  return Math.max(...values);
}

function money(n) {
  try {
    return Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  } catch {
    return String(n);
  }
}

function buildGoalSelect({ value, max = 50000 }) {
  const sel = document.createElement('select');

  // placeholder
  const opt0 = document.createElement('option');
  opt0.value = '';
  opt0.textContent = 'Select a goal…';
  sel.appendChild(opt0);

  for (let v = 500; v <= max; v += 500) {
    const opt = document.createElement('option');
    opt.value = String(v);
    opt.textContent = `$${money(v)}`;
    sel.appendChild(opt);
  }

  // a couple bigger options
  [75000, 100000, 150000, 200000].forEach((v) => {
    const opt = document.createElement('option');
    opt.value = String(v);
    opt.textContent = `$${money(v)}`;
    sel.appendChild(opt);
  });

  sel.value = value ? String(value) : '';
  return sel;
}

/**
 * ProgressCheck
 * @param {Object} args
 * @param {Array}  args.favItems - array of scholarship objects (must include {id, amount})
 * @param {Function} args.onChanged - called when goal/status changes (optional)
 */
export function ProgressCheck({ favItems = [], onChanged } = {}) {
  const wrap = document.createElement('section');
  wrap.className = 'pc card';

  const statusById = getStatusMap();

  const compute = () => {
    const goal = getGoalValue();

    // ✅ always get the latest statuses
    const statusById = getStatusMap();

    let totalEligible = 0;
    let totalReceived = 0;

    for (const it of favItems) {
        const n = parseAmountToNumber(it.amount);
        if (n == null) continue;

        const st = statusById[it.id] || 'Applied';
        if (st !== 'Denied') totalEligible += n;
        if (st === 'Received') totalReceived += n;
    }

    return { goal, totalEligible, totalReceived };
  };


  const header = document.createElement('div');
  header.className = 'pc-head';

  const title = document.createElement('div');
  title.className = 'pc-title';
  title.textContent = 'Goal Tracker';
  header.appendChild(title);

  const controls = document.createElement('div');
  controls.className = 'pc-controls';
  header.appendChild(controls);

  const body = document.createElement('div');
  body.className = 'pc-body';

  const hint = document.createElement('p');
  hint.className = 'pc-sub';
  hint.textContent =
    'Set a goal, then track your saved scholarships (purple) and received awards (green).';

  const bar = document.createElement('div');
  bar.className = 'pc-bar';

  const purple = document.createElement('div');
  purple.className = 'pc-fill pc-fill--purple';

  const green = document.createElement('div');
  green.className = 'pc-fill pc-fill--green';

  bar.appendChild(purple);
  bar.appendChild(green);

  const stats = document.createElement('div');
  stats.className = 'pc-stats';

  body.appendChild(hint);
  body.appendChild(bar);
  body.appendChild(stats);

  wrap.appendChild(header);
  wrap.appendChild(body);

  function renderControls() {
    controls.innerHTML = '';
    const goal = getGoalValue();

    if (!goal) {
      // First usage: force set goal
      const label = document.createElement('div');
      label.className = 'pc-pill';
      label.textContent = 'Set your goal:';

      const sel = buildGoalSelect({ value: 0 });
      sel.className = 'pc-goal-select';

      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.type = 'button';
      btn.textContent = 'Save';

      btn.addEventListener('click', () => {
        const v = Number(sel.value);
        if (!v) return;
        setGoalValue(v);
        renderAll();
        onChanged?.();
      });

      controls.appendChild(label);
      controls.appendChild(sel);
      controls.appendChild(btn);
    } else {
      const pill = document.createElement('div');
      pill.className = 'pc-pill';
      pill.textContent = `Goal: $${money(goal)}`;

      const edit = document.createElement('button');
      edit.className = 'btn secondary';
      edit.type = 'button';
      edit.textContent = 'Edit';

      edit.addEventListener('click', () => {
        controls.innerHTML = '';

        const sel = buildGoalSelect({ value: goal });
        sel.className = 'pc-goal-select';

        const save = document.createElement('button');
        save.className = 'btn';
        save.type = 'button';
        save.textContent = 'Save';

        const cancel = document.createElement('button');
        cancel.className = 'btn secondary';
        cancel.type = 'button';
        cancel.textContent = 'Cancel';

        save.addEventListener('click', () => {
          const v = Number(sel.value);
          if (!v) return;
          setGoalValue(v);
          renderAll();
          onChanged?.();
        });

        cancel.addEventListener('click', () => renderControls());

        controls.appendChild(pill);
        controls.appendChild(sel);
        controls.appendChild(save);
        controls.appendChild(cancel);
      });

      controls.appendChild(pill);
      controls.appendChild(edit);
    }
  }

  function renderBars() {
    const { goal, totalEligible, totalReceived } = compute();

    if (!goal) {
      bar.style.display = 'none';
      stats.innerHTML = `<div class="pc-note">Choose a goal to begin tracking.</div>`;
      return;
    }

    bar.style.display = 'block';

    const purplePct = Math.max(0, Math.min(1, totalEligible / goal));
    const greenPct = Math.max(0, Math.min(1, totalReceived / goal));

    purple.style.width = `${purplePct * 100}%`;
    green.style.width = `${greenPct * 100}%`;

    stats.innerHTML = `
      <div class="pc-row">
        <span class="pc-dot pc-dot--purple"></span>
        <span>Saved (not denied): <b>$${money(totalEligible)}</b></span>
      </div>
      <div class="pc-row">
        <span class="pc-dot pc-dot--green"></span>
        <span>Received: <b>$${money(totalReceived)}</b></span>
      </div>
      <div class="pc-row pc-row--muted">
        <span>Goal: <b>$${money(goal)}</b></span>
      </div>
    `;
  }

  function renderAll() {
    renderControls();
    renderBars();
  }

  renderAll();

  // expose a small API so favorites.js can refresh after status changes
  wrap.__pcRefresh = () => {
    renderBars();
  };

  return wrap;
}
