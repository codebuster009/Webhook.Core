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
    isActive
      ? 'border-r-2 border-accent bg-gray-50 text-accent'
      : 'text-muted hover:bg-gray-50'
  );

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white py-6 md:flex">
      <div className="px-6 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-black text-white">
            <LayoutDashboard size={18} />
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider">
            Financial Webhooks
          </span>
        </div>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-gray-400">
          Institutional Node
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-4">
        <NavLink to="/" end className={itemClass}>
          <LayoutDashboard size={18} /> Overview
        </NavLink>
        <NavLink to="/events" className={itemClass}>
          <LineChart size={18} /> Event Monitoring
        </NavLink>
        <NavLink to="/partners" className={itemClass}>
          <Settings size={18} /> Partner Settings
        </NavLink>
      </nav>
      <div className="mt-auto space-y-1 border-t border-gray-100 px-4 pt-6">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted hover:bg-gray-50"
        >
          <HeartPulse size={18} /> System Health
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted hover:bg-gray-50"
        >
          <LifeBuoy size={18} /> Support
        </button>
      </div>
    </aside>
  );
}
