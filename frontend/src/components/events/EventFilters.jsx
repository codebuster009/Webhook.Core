import { useMemo } from 'react';
import clsx from 'clsx';
import { Button } from '../ui/Button.jsx';
import { EVENT_TYPES, EVENT_STATUSES } from '../../lib/constants.js';

export default function EventFilters({
  partners,
  partnerId,
  status,
  eventType,
  search,
  from,
  to,
  onChange,
  onClear,
}) {
  const partnerOptions = useMemo(() => partners || [], [partners]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-medium text-muted">
          Partner
          <select
            className="mt-1 block w-44 rounded-md border border-gray-200 bg-white px-2 py-2 text-sm"
            value={partnerId}
            onChange={(e) => onChange({ partner_id: e.target.value })}
          >
            <option value="">All</option>
            {partnerOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-muted">
          Status
          <select
            className="mt-1 block w-40 rounded-md border border-gray-200 bg-white px-2 py-2 text-sm"
            value={status}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <option value="">All</option>
            {EVENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-muted">
          Event Type
          <select
            className="mt-1 block w-48 rounded-md border border-gray-200 bg-white px-2 py-2 text-sm"
            value={eventType}
            onChange={(e) => onChange({ event_type: e.target.value })}
          >
            <option value="">All</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-muted">
          From
          <input
            type="datetime-local"
            className="mt-1 block rounded-md border border-gray-200 px-2 py-2 text-sm"
            value={from}
            onChange={(e) => onChange({ from: e.target.value })}
          />
        </label>
        <label className="text-xs font-medium text-muted">
          To
          <input
            type="datetime-local"
            className="mt-1 block rounded-md border border-gray-200 px-2 py-2 text-sm"
            value={to}
            onChange={(e) => onChange({ to: e.target.value })}
          />
        </label>
        <label className="text-xs font-medium text-muted">
          Search
          <input
            className="mt-1 block w-56 rounded-md border border-gray-200 px-3 py-2 text-sm"
            placeholder="external id, txn id…"
            value={search}
            onChange={(e) => onChange({ search: e.target.value })}
          />
        </label>
        <Button variant="ghost" className="ml-auto" type="button" onClick={onClear}>
          CLEAR ALL
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {partnerId ? (
          <Chip label={`PARTNER: ${partnerOptions.find((p) => p.id === partnerId)?.name || partnerId}`} />
        ) : null}
        {status ? <Chip label={`STATUS: ${status.toUpperCase()}`} tone="bad" /> : null}
        {eventType ? <Chip label={`TYPE: ${eventType}`} /> : null}
      </div>
    </div>
  );
}

function Chip({ label, tone }) {
  return (
    <span
      className={clsx(
        'rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase',
        tone === 'bad'
          ? 'bg-red-50 text-error ring-1 ring-red-100'
          : 'bg-accent/10 text-accent ring-1 ring-accent/20'
      )}
    >
      {label}
    </span>
  );
}
