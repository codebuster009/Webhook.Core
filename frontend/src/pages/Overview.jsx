import { useNavigate } from 'react-router-dom';
import { useStatsOverview } from '../hooks/useStats.js';
import { Button } from '../components/ui/Button.jsx';
import { Download, Bell } from 'lucide-react';
import KpiCard from '../components/overview/KpiCard.jsx';
import DeliveriesLatencyChart from '../components/overview/DeliveriesLatencyChart.jsx';
import LiveEventsFeed from '../components/overview/LiveEventsFeed.jsx';
import EndpointSummaryTable from '../components/overview/EndpointSummaryTable.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export default function Overview() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useStatsOverview();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Unable to load dashboard"
        description="Check API connectivity and try again."
        action={
          <Button type="button" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  const ir = data.ingestion_rate ?? 0;
  const sr = (data.success_rate ?? 0) * 100;
  const ar = data.active_retries ?? 0;
  const fl = data.failed_last_60m ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Delivery Dashboard
          </h1>
          <p className="text-sm text-muted">
            Real-time infrastructure monitoring for institutional endpoints.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[11px] font-bold uppercase text-green-700">
              System operational
            </span>
          </div>
          <Button
            type="button"
            className="flex items-center gap-2"
            onClick={() => navigate('/events')}
          >
            <Download size={18} /> Export report (events)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Ingestion Rate">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{ir.toFixed(1)}</span>
            <span className="text-sm text-muted">events/sec</span>
          </div>
        </KpiCard>
        <KpiCard label="Success Rate">
          <div className="text-3xl font-semibold text-accent">{sr.toFixed(2)}%</div>
        </KpiCard>
        <KpiCard label="Active Retries">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{ar}</span>
            <span className="text-sm text-muted">queues</span>
          </div>
        </KpiCard>
        <KpiCard label="Failed Deliveries" tone="danger">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-error">{fl}</span>
            <span className="text-sm text-error/80">last 60m</span>
          </div>
        </KpiCard>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Deliveries vs. Latency</h2>
            <div className="flex gap-4 text-[11px] font-mono uppercase text-muted">
              <span className="flex items-center gap-2">
                <span className="h-0.5 w-4 bg-black" /> Deliveries
              </span>
              <span className="flex items-center gap-2">
                <span className="h-0.5 w-4 bg-accent" /> Latency
              </span>
            </div>
          </div>
          <DeliveriesLatencyChart
            deliveriesTs={data.deliveries_timeseries}
            latencyTs={data.latency_timeseries}
          />
        </div>
        <div id="live" className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Live Events</h2>
          <LiveEventsFeed items={data.live_events} />
        </div>
      </div>

      <EndpointSummaryTable rows={data.endpoint_summary} />

      <a
        href="#live"
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition hover:scale-105"
        aria-label="Jump to live feed"
      >
        <Bell className="h-7 w-7" />
      </a>
    </div>
  );
}
