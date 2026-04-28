import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, HelpCircle } from 'lucide-react';
import clsx from 'clsx';
import { useWalkthrough } from '../../walkthrough/WalkthroughContext.jsx';

import { tourIdForPathname, tourLabelForPathname } from '../../walkthrough/tourIdForPathname.js';

const tabClass = ({ isActive }) =>
  clsx(
    'rounded-md px-2 py-1 text-sm',
    isActive
      ? 'font-semibold text-accent'
      : 'text-gray-500 hover:bg-gray-50'
  );

export default function TopBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { startTour } = useWalkthrough();

  function onBellClick() {
    if (pathname === '/') {
      navigate({ pathname: '/', hash: 'live' });
      queueMicrotask(() => {
        document.getElementById('live')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else {
      navigate('/events');
    }
  }

  function onHelpClick() {
    const tourId = tourIdForPathname(pathname);
    startTour(tourId, { force: true });
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/90 px-6 backdrop-blur">
      <div className="flex items-center gap-8">
        <span className="font-mono text-lg font-bold tracking-tight text-black">
          Webhook.Core
        </span>
        <nav className="hidden gap-6 md:flex">
          <NavLink to="/" className={tabClass}>
            Overview
          </NavLink>
          <NavLink to="/events" className={tabClass}>
            Events
          </NavLink>
          <NavLink to="/partners" className={tabClass}>
            Partners
          </NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBellClick}
          className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          aria-label={
            pathname === '/'
              ? 'Jump to live events feed on this page'
              : 'Open events — new deliveries appear in the event list'
          }
          title={
            pathname === '/'
              ? 'Jump to live feed'
              : 'View events (live ingestion stream)'
          }
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onHelpClick}
          className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          aria-label={`Start tour for this page (${tourLabelForPathname(pathname)})`}
          title={`Walkthrough: ${tourLabelForPathname(pathname)}`}
        >
          <HelpCircle className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2 pl-1">
          <img
            src="/demo-avatar.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-full border border-gray-200 bg-gray-100 object-cover"
          />
          <span className="hidden text-xs font-semibold uppercase tracking-wide text-gray-600 sm:inline">
            Demo
          </span>
        </div>
      </div>
    </header>
  );
}
