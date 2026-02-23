export function Badge(text) {
  const el = document.createElement('span');
  el.className = 'badge';
  el.textContent = text;
  return el;
} 
