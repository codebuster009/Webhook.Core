import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import EventFilters from '../components/events/EventFilters.jsx';
import EventStatusPill from '../components/events/EventStatusPill.jsx';
import EventTypeBadge from '../components/events/EventTypeBadge.jsx';
import { useEvents } from '../hooks/useEvents.js';
import { usePartners } from '../hooks/usePartners.js';
import { sendTestEvent } from '../services/partners.api.js';
import { formatRelative } from '../lib/format.js';
import { Inbox } from 'lucide-react';

function toCsv(rows) {
  const header = [
    'id',
    'external_id',
    'partner',
    'event_type',
    'transaction_id',
    'status',
    'attempts',
    'created_at',
  ];
  const lines = [header.join(',')];
  for (const e of rows) {
    lines.push(
      [
        e.id,
        e.external_id,
        (e.partner?.name || '').replaceAll(',', ' '),
        e.event_type,
        e.transaction_id,
        e.status,
        `${e.attempt_count}/${e.max_attempts}`,
        e.created_at,
      ].join(',')
    );
  }
  return lines.join('\n');
}

export default function EventsList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const { data: partners = [] } = usePartners();
  const [filters, setFilters] = useState({
    partner_id: '',
    status: '',
    event_type: '',
    search: '',
    from: '',
    to: '',
    page: 1,
    limit: 25,
  });

  useEffect(() => {
    const pid = searchParams.get('partner_id');
    if (pid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- URL is external source of truth for deep links
      setFilters((f) => ({ ...f, partner_id: pid, page: 1 }));
    }
  }, [searchParams]);
  const [testOpen, setTestOpen] = useState(false);
  const [testPartnerId, setTestPartnerId] = useState('');
  const [testing, setTesting] = useState(false);

  const queryParams = useMemo(() => {
    const p = { ...filters };
    Object.keys(p).forEach((k) => {
      if (p[k] === '' || p[k] === null || p[k] === undefined) delete p[k];
    });
    return p;
  }, [filters]);

  const { data, isLoading, isError, refetch, isFetching } = useEvents(queryParams);

  const events = data?.events ?? [];
  const total = data?.total ?? 0;
  const page = data?.page ?? 1;
  const limit = data?.limit ?? 25;

  function applyFilter(patch) {
    setFilters((f) => ({ ...f, ...patch, page: 1 }));
  }

  function clearFilters() {
    setFilters({
      partner_id: '',
      status: '',
      event_type: '',
      search: '',
      from: '',
      to: '',
      page: 1,
      limit: 25,
    });
  }

  function exportCsv() {
    const blob = new Blob([toCsv(events)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function runTest() {
    if (!testPartnerId) return;
    setTesting(true);
    try {
      await sendTestEvent(testPartnerId);
      setTestOpen(false);
      await qc.invalidateQueries({ queryKey: ['events'] });
    } finally {
      setTesting(false);
    }
  }

  const hasActiveFilters =
    Boolean(filters.partner_id) ||
    Boolean(filters.status) ||
    Boolean(filters.event_type) ||
    Boolean(filters.search) ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  if (isLoading && !data) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Could not load events"
        action={
          <Button type="button" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        data-tour="events-header"
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">Events</h1>
            {isFetching && data ? (
              <div className="flex items-center gap-2 rounded-full border border-accent/35 bg-accent/5 px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <span className="text-[11px] font-bold uppercase text-primary">Live · updating</span>
              </div>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted">
            All webhook delivery events across partners. The table polls the API about every half second so
            new rows appear quickly while the simulator or worker is running.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" type="button" onClick={() => setTestOpen(true)}>
            Send Test Event
          </Button>
          <Button type="button" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4" data-tour="events-filters">
        <EventFilters
          partners={partners}
          partnerId={filters.partner_id}
          status={filters.status}
          eventType={filters.event_type}
          search={filters.search}
          from={filters.from}
          to={filters.to}
          onChange={applyFilter}
          onClear={clearFilters}
        />
      </div>

      <div data-tour="events-body">
      {events.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="No events match filters"
            description="Try clearing filters or widening your search."
            icon={Inbox}
            action={
              <Button type="button" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No events yet"
            description="Send a test event from the Partners or Events page, or wait for ingestion."
            icon={Inbox}
          />
        )
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {[
                'Event ID',
                'Partner',
                'Event Type',
                'Transaction ID',
                'Status',
                'Attempts',
                'Created',
                'Last Response',
              ].map((h) => (
                <th key={h} className="px-4 py-3 font-mono text-[11px] uppercase text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {events.map((e) => (
              <tr
                key={e.id}
                className="cursor-pointer hover:bg-canvas/80"
                onClick={() => navigate(`/events/${e.id}`)}
              >
                <td className="px-4 py-3 font-mono text-xs">{e.id}</td>
                <td className="px-4 py-3">{e.partner?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <EventTypeBadge type={e.event_type} />
                </td>
                <td className="px-4 py-3 font-mono text-xs">{e.transaction_id}</td>
                <td className="px-4 py-3">
                  <EventStatusPill status={e.status} />
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {e.attempt_count}/{e.max_attempts}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">
                  {formatRelative(e.created_at)}
                </td>
                <td className="px-4 py-3 font-mono text-xs">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {events.length > 0 ? (
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          SHOWING {events.length} OF {total.toLocaleString()} EVENTS
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            className="font-medium text-accent disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
          >
            Previous
          </button>
          <button
            type="button"
            className="font-medium text-accent disabled:opacity-40"
            disabled={page * limit >= total}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
          >
            Next
          </button>
        </div>
      </div>
      ) : null}
      </div>

      <Modal
        open={testOpen}
        title="Send test event"
        onClose={() => setTestOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setTestOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!testPartnerId || testing} onClick={runTest}>
              Send
            </Button>
          </div>
        }
      >
        <label className="block text-sm text-muted">
          Partner
          <select
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            value={testPartnerId}
            onChange={(e) => setTestPartnerId(e.target.value)}
          >
            <option value="">Select…</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </Modal>
    </div>
  );
}
