import { NavLink } from 'react-router-dom';
import { Bell, HelpCircle } from 'lucide-react';
import clsx from 'clsx';

const tabClass = ({ isActive }) =>
  clsx(
    'rounded-md px-2 py-1 text-sm',
    isActive
      ? 'font-semibold text-accent'
      : 'text-gray-500 hover:bg-gray-50'
  );

export default function TopBar() {
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
      <div className="flex items-center gap-4 text-gray-500">
        <Bell className="h-5 w-5 cursor-pointer" />
        <HelpCircle className="h-5 w-5 cursor-pointer" />
        <div className="h-8 w-8 rounded-full border border-gray-200 bg-gray-100" />
      </div>
    </header>
  );
}
