const KEY = 'scholarship_favorites_v1';

export function getFavorites() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function isFavorited(id) {
  return getFavorites().includes(id);
}

export function toggleFavorite(id) {
  const favs = new Set(getFavorites());
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);

  localStorage.setItem(KEY, JSON.stringify([...favs]));
  return [...favs];
}

export function clearFavorites() {
  localStorage.removeItem(KEY);
}
