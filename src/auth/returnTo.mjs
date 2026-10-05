// Only local application destinations are accepted; never redirect to another origin.
export function safeReturnTo(value) {
  // Control characters are rejected intentionally to prevent URL parser normalization.
  // eslint-disable-next-line no-control-regex
  if (typeof value !== 'string' || !value.startsWith('/') || /^\/\/|[\\\s\u0000-\u001f]/.test(value)) return null;
  try {
    const url = new URL(value, 'https://techminds.local');
    if (url.origin !== 'https://techminds.local' || /^\/(login|register)(\/|$)/.test(url.pathname)) return null;
    return url.pathname + url.search + url.hash;
  } catch { return null; }
}

export function authEntry(destination, page = '/login') {
  const next = safeReturnTo(destination);
  return next ? `${page}${page.includes('?') ? '&' : '?'}next=${encodeURIComponent(next)}` : page;
}
