export function formatRelative(iso) {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return 'Just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return d.toLocaleString();
}

export function formatLatency(ms) {
  if (ms == null || Number.isNaN(ms)) return '—';
  return `${Math.round(ms)}ms`;
}

export function truncateMiddle(str, max = 48) {
  if (!str || str.length <= max) return str || '';
  const half = Math.floor((max - 3) / 2);
  return `${str.slice(0, half)}…${str.slice(str.length - half)}`;
}
