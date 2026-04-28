import { formatRelative } from '../../lib/format.js';

function Pill({ ok, children }) {
  const cls = ok
    ? 'bg-accent/10 text-accent border-accent/30'
    : 'bg-red-50 text-error border-red-200';
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-accent' : 'bg-error'}`} />
      {children}
    </span>
  );
}

export default function LiveEventsFeed({ items = [] }) {
  return (
    <div className="space-y-4">
      {items.map((e, i) => {
        const delivered = e.status === 'delivered';
        const retrying = ['retrying', 'in_flight', 'pending'].includes(e.status);
        const label = delivered ? 'SUCCESS' : retrying ? 'RETRYING' : e.status.toUpperCase();
        const right = delivered
          ? `${e.last_latency_ms ?? '—'}ms`
          : e.last_code
            ? `${e.last_code} ERR`
            : 'ERR';
        return (
          <div
            key={e.id}
            className="live-feed-row space-y-2 border-b border-gray-50 pb-4 last:border-0"
            style={{ animationDelay: `${Math.min(i, 10) * 48}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-xs text-muted">{e.id}</span>
              <Pill ok={delivered}>{label}</Pill>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium">
                  {e.partner_name} • {e.event_type}
                </p>
                <p className="font-mono text-xs text-gray-400">
                  {formatRelative(e.created_at)}
                </p>
              </div>
              <span
                className={`font-mono text-xs ${delivered ? 'text-accent' : 'text-error'}`}
              >
                {right}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
