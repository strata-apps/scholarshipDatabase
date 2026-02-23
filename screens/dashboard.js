// screens/dashboard.js
import { getFavorites } from '../components/storage.js';
import { ProgressCheck, parseAmountToNumber } from '../components/progressCheck.js';
import { KpiCard } from '../components/kpiCard.js';
import { EventsList } from '../components/eventsList.js';
import { DeadlinesWithinWeek } from '../components/deadlinesList.js';

function money(n) {
  try {
    return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  } catch {
    return `$${n}`;
  }
}

export function renderDashboardScreen(mount, scholarships, rerenderApp) {
  mount.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'page page--single';

  const main = document.createElement('main');
  main.className = 'main';

  // ✅ Dashboard container (adds width + padding)
  const wrap = document.createElement('div');
  wrap.className = 'dashboard-wrap';

  // ---- (1) Total available dollars in DB ----
  const total = scholarships.reduce((sum, s) => {
    const n = parseAmountToNumber(s.amount);
    return sum + (n ?? 0);
  }, 0);

  // ✅ KPIs row
  const kpis = document.createElement('div');
  kpis.className = 'dashboard-kpis';

  kpis.appendChild(
    KpiCard({
      title: 'Total Available Dollars to Search Through',
      value: money(total),
      sub: 'and counting',
    })
  );

  // ---- (4) Goal & progress (favorites-based) ----
  const favIds = new Set(getFavorites());
  const favItems = scholarships.filter((s) => favIds.has(s.id));

  const progress = ProgressCheck({
    favItems,
    onChanged: () => progress.__pcRefresh?.(),
  });

  // ---- Layout grid ----
  const grid = document.createElement('div');
  grid.className = 'dashboard-grid';

  const leftCol = document.createElement('div');
  leftCol.className = 'dashboard-col';

  const rightCol = document.createElement('div');
  rightCol.className = 'dashboard-col';

  // (2) Upcoming events (already scrollable internally)
  const events = EventsList({ limit: 50 });

  // (3) Deadlines within a week (we’ll make scrollable below via a small change)
  const deadlines = DeadlinesWithinWeek({
    scholarships,
    parseAmountToNumber,
    maxItems: 50, // optional param we'll support below
  });

  leftCol.appendChild(events);
  leftCol.appendChild(deadlines);

  rightCol.appendChild(progress);

  grid.appendChild(leftCol);
  grid.appendChild(rightCol);

  // Assemble
  wrap.appendChild(kpis);
  wrap.appendChild(grid);
  main.appendChild(wrap);

  page.appendChild(main);
  mount.appendChild(page);

  page.__refresh = () => progress.__pcRefresh?.();
}
