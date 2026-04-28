import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  Settings,
  HeartPulse,
} from 'lucide-react';
import clsx from 'clsx';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { api } from '../../services/api.js';

const itemClass = ({ isActive }) =>
  clsx(
    'flex items-center gap-3 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider',
    'justify-center lg:justify-start',
    isActive
      ? 'border-r-2 border-accent bg-gray-50 text-accent'
      : 'text-muted hover:bg-gray-50'
  );

export default function Sidebar() {
  const [healthOpen, setHealthOpen] = useState(false);
  const [health, setHealth] = useState(null);
  const [healthErr, setHealthErr] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- one-shot health fetch on modal open */
  useEffect(() => {
    if (!healthOpen) return undefined;
    const ac = new AbortController();
    setHealth(null);
    setHealthErr(null);
    setHealthLoading(true);
    api
      .get('/healthz', { signal: ac.signal })
      .then((res) => setHealth(res.data))
      .catch((e) => {
        if (e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return;
        setHealthErr(
          e?.message || (typeof e === 'string' ? e : 'Could not reach API health endpoint')
        );
      })
      .finally(() => setHealthLoading(false));
    return () => ac.abort();
  }, [healthOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <>
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
        <div className="mt-auto border-t border-gray-100 px-2 pt-6 lg:px-4">
          <button
            type="button"
            title="System health"
            onClick={() => setHealthOpen(true)}
            className="flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted hover:bg-gray-50 lg:justify-start"
          >
            <HeartPulse size={18} className="shrink-0" />
            <span className="hidden lg:inline">System Health</span>
          </button>
        </div>
      </aside>

      <Modal
        open={healthOpen}
        title="System health"
        onClose={() => setHealthOpen(false)}
        footer={
          <div className="flex justify-end">
            <Button type="button" onClick={() => setHealthOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {healthLoading ? (
          <p className="text-sm text-muted">Checking API…</p>
        ) : healthErr ? (
          <p className="text-sm text-error">{healthErr}</p>
        ) : health?.ok && health.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                  health.data.db ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-error'
                }`}
              >
                {health.data.db ? 'Database connected' : 'Database unreachable'}
              </span>
            </div>
            <pre className="max-h-64 overflow-auto rounded-md border border-gray-100 bg-gray-50 p-3 font-mono text-xs">
              {JSON.stringify(health, null, 2)}
            </pre>
            <p className="text-xs text-muted">Source: GET /healthz on your configured API base URL.</p>
          </div>
        ) : (
          <p className="text-sm text-muted">Unexpected response.</p>
        )}
      </Modal>
    </>
  );
}
