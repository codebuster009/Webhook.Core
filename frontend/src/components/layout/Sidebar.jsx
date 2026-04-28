import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  Settings,
  HeartPulse,
  LifeBuoy,
} from 'lucide-react';
import clsx from 'clsx';

const itemClass = ({ isActive }) =>
  clsx(
    'flex items-center gap-3 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider',
    'justify-center lg:justify-start',
    isActive
      ? 'border-r-2 border-accent bg-gray-50 text-accent'
      : 'text-muted hover:bg-gray-50'
  );

export default function Sidebar() {
  return (
    <aside className="hidden w-[4.5rem] shrink-0 flex-col border-r border-gray-200 bg-white py-6 md:flex lg:w-64">
      <div className="px-3 pb-6 lg:px-6">
        <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-center lg:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-black text-white">
            <LayoutDashboard size={18} />
          </div>
          <div className="hidden text-center lg:block lg:text-left">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              Financial Webhooks
            </span>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-gray-400">
              Institutional Node
            </p>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-2 lg:px-4">
        <NavLink to="/" end className={itemClass} title="Overview">
          <LayoutDashboard size={18} className="shrink-0" />
          <span className="hidden lg:inline">Overview</span>
        </NavLink>
        <NavLink to="/events" className={itemClass} title="Event Monitoring">
          <LineChart size={18} className="shrink-0" />
          <span className="hidden lg:inline">Event Monitoring</span>
        </NavLink>
        <NavLink to="/partners" className={itemClass} title="Partner Settings">
          <Settings size={18} className="shrink-0" />
          <span className="hidden lg:inline">Partner Settings</span>
        </NavLink>
      </nav>
      <div className="mt-auto space-y-1 border-t border-gray-100 px-2 pt-6 lg:px-4">
        <button
          type="button"
          title="System Health"
          className="flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted hover:bg-gray-50 lg:justify-start"
        >
          <HeartPulse size={18} className="shrink-0" />
          <span className="hidden lg:inline">System Health</span>
        </button>
        <button
          type="button"
          title="Support"
          className="flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted hover:bg-gray-50 lg:justify-start"
        >
          <LifeBuoy size={18} className="shrink-0" />
          <span className="hidden lg:inline">Support</span>
        </button>
      </div>
    </aside>
  );
}
