const TOUR_LABELS = {
  webhookOverview: 'Overview',
  webhookEvents: 'Events',
  webhookPartners: 'Partners',
  webhookEventDetail: 'Event detail',
};

/**
 * Resolve walkthrough id from React Router pathname (no query string).
 */
export function tourIdForPathname(pathname) {
  const p = pathname.replace(/\/+$/, '') || '/';

  if (p === '/' || p === '') return 'webhookOverview';
  if (p === '/events') return 'webhookEvents';
  if (p.startsWith('/events/')) return 'webhookEventDetail';
  if (p === '/partners') return 'webhookPartners';

  return 'webhookOverview';
}

/**
 * Short label for tooltips / aria (matches tour id from pathname).
 */
export function tourLabelForPathname(pathname) {
  const id = tourIdForPathname(pathname);
  return TOUR_LABELS[id] ?? 'Overview';
}
