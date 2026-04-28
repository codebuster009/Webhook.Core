import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import AttemptHistoryTable from '../components/events/AttemptHistoryTable.jsx';
import RawJsonPanel from '../components/events/RawJsonPanel.jsx';
import DeliveryHttpTrace from '../components/events/DeliveryHttpTrace.jsx';
import EventStatusPill from '../components/events/EventStatusPill.jsx';
import SignatureDeliveryBadge from '../components/events/SignatureDeliveryBadge.jsx';
import { useEventDetail } from '../hooks/useEventDetail.js';
import { redeliverEvent } from '../services/events.api.js';
import { formatLatency, truncateMiddle } from '../lib/format.js';
import { useQueryClient } from '@tanstack/react-query';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useEventDetail(id);
  const [openHeaders, setOpenHeaders] = useState(false);
  const [busy, setBusy] = useState(false);

  async function retry() {
    setBusy(true);
    try {
      await redeliverEvent(id);
      await refetch();
      await qc.invalidateQueries({ queryKey: ['events'] });
    } finally {
      setBusy(false);
    }
  }

  if (isLoading && !data) {
    return <Skeleton className="h-64 w-full" />;
  }
  if (isError || !data) {
    return (
      <EmptyState
        title="Event not found"
        action={
          <Button type="button" onClick={() => navigate('/events')}>
            Back to events
          </Button>
        }
      />
    );
  }

  const { event, attempts = [] } = data;
  const latestAttempt =
    attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const finalLatency = latestAttempt?.latency_ms;

  return (
    <div className="space-y-6">
      <div
        className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
        data-tour="eventdetail-header"
      >
        <div>
          <div className="text-xs text-muted">
            <Link className="text-accent hover:underline" to="/events">
              Events
            </Link>{' '}
            &gt;{' '}
            <span className="font-mono">{event.id}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold">Event Detail</h1>
          <p className="text-sm text-muted">
            {event.event_type} •{' '}
            <span className="font-mono text-xs">{event.transaction_id}</span>
          </p>
        </div>
        <Button type="button" disabled={busy} onClick={retry} className="gap-2">
          <RefreshCw size={16} /> Manual Retry
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4" data-tour="eventdetail-kpis">
        <SummaryCard title="Status">
          <EventStatusPill status={event.status} />
        </SummaryCard>
        <SummaryCard title="Event Type">
          <span className="font-mono text-sm">{event.event_type}</span>
        </SummaryCard>
        <SummaryCard title="Total Attempts">
          <span className="font-mono text-lg">
            {event.attempt_count} / {event.max_attempts}
          </span>
        </SummaryCard>
        <SummaryCard title="Final Latency">
          <span className="font-mono text-lg">{formatLatency(finalLatency)}</span>
        </SummaryCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <Meta label="Partner" value={event.partner?.name ?? '—'} />
            <Meta label="Transaction ID" value={event.transaction_id} mono />
            <Meta
              label="Created"
              value={event.created_at ? new Date(event.created_at).toLocaleString() : '—'}
            />
            <Meta
              label="Webhook URL"
              value={truncateMiddle(event.partner?.webhookUrl || '', 56)}
              mono
            />
          </div>
        </div>
        <SignatureDeliveryBadge latestAttempt={latestAttempt} />
      </div>

      <div data-tour="eventdetail-payload">
        <RawJsonPanel value={event.payload} />
      </div>

      <div className="space-y-3" data-tour="eventdetail-attempts">
        <h2 className="text-lg font-semibold">Delivery Attempt History</h2>
        <AttemptHistoryTable attempts={attempts} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white" data-tour="eventdetail-trace">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
          onClick={() => setOpenHeaders((v) => !v)}
        >
          DELIVERY HTTP TRACE
          <span className="text-muted">{openHeaders ? '▾' : '▸'}</span>
        </button>
        {openHeaders ? <DeliveryHttpTrace attempts={attempts} /> : null}
      </div>
    </div>
  );
}

function SummaryCard({ title, children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-[11px] font-mono uppercase tracking-wide text-muted">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Meta({ label, value, mono }) {
  return (
    <div>
      <div className="text-[11px] font-mono uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 text-sm ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
    </div>
  );
}

