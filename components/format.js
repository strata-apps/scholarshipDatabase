export function normalize(str) {
  return (str ?? '').toString().trim().toLowerCase();
}

export function parseAmountToNumber(amountStr) {
  // best-effort numeric extraction: "$10,000" -> 10000, "Max $40,000" -> 40000
  const s = (amountStr ?? '').toString();
  const nums = s.replace(/[^0-9]/g, '');
  if (!nums) return null;
  const n = Number(nums);
  return Number.isFinite(n) ? n : null;
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function daysUntil(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
