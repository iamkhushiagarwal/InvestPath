const STORAGE_KEY = "investpath_watchlist";

export function getWatchlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToWatchlist(ticker) {
  const current = getWatchlist();
  if (!current.includes(ticker)) {
    const updated = [...current, ticker];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
  return current;
}

export function removeFromWatchlist(ticker) {
  const updated = getWatchlist().filter((t) => t !== ticker);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

const DATA_CACHE_KEY = "investpath_watchlist_data";
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedCompanyData(ticker) {
  try {
    const raw = localStorage.getItem(DATA_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    const entry = cache[ticker];
    if (!entry) return null;

    const isStale = Date.now() - entry.timestamp > CACHE_MAX_AGE_MS;
    return isStale ? null : entry.data;
  } catch {
    return null;
  }
}

export function setCachedCompanyData(ticker, data) {
  try {
    const raw = localStorage.getItem(DATA_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[ticker] = { data, timestamp: Date.now() };
    localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // fail silently — caching is an optimization, not critical to app function
  }
}
const TRENDING_CACHE_KEY = "investpath_trending_cache";
const TRENDING_CACHE_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes

export function getCachedTrending() {
  try {
    const raw = localStorage.getItem(TRENDING_CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    const isStale = Date.now() - entry.timestamp > TRENDING_CACHE_MAX_AGE_MS;
    return isStale ? null : entry.data;
  } catch {
    return null;
  }
}

export function setCachedTrending(data) {
  try {
    localStorage.setItem(TRENDING_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // fail silently
  }
}