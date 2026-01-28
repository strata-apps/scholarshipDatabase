// components/favoritesExport.js
import { getStatusMap } from './progressCheck.js';

function escapeCsv(v) {
  const s = v == null ? '' : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

function toIsoDateSafe() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildCsv(items, columns) {
  const header = columns.map(c => escapeCsv(c.header)).join(',');

  const rows = items.map(it =>
    columns.map(c => {
      const val = typeof c.get === 'function' ? c.get(it) : it?.[c.key];
      return escapeCsv(val);
    }).join(',')
  );

  return [header, ...rows].join('\n');
}

export function FavoritesExportButton({
  items = [],
  filenamePrefix = 'favorites',
  className = 'btn secondary',
  label = 'Export CSV'
}) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = className;
  btn.textContent = label;

  btn.addEventListener('click', () => {
    if (!items.length) {
      alert('No favorites to export.');
      return;
    }

    const columns = [
      { key: 'name', header: 'Name' },
      { key: 'amount', header: 'Amount' },
      { key: 'region', header: 'Region' },
      { key: 'closeDate', header: 'Close Date' },
      { key: 'url', header: 'URL' },
      { header: 'Status', get: (it) => getStatusMap()?.[it.id] ?? '' },
    ];

    const csv = buildCsv(items, columns);
    downloadTextFile(`${filenamePrefix}_${toIsoDateSafe()}.csv`, csv);
  });

  return btn;
}
