import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function DeliveriesLatencyChart({ deliveriesTs = [], latencyTs = [] }) {
  if (!deliveriesTs.length) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-md border border-dashed border-border/80 bg-surface/30 px-6 text-center">
        <p className="max-w-md text-sm text-muted">
          No successful deliveries in the last 24 hours (chart uses completed attempts with
          outcome <span className="font-mono text-foreground/80">success</span> only). Failed
          or retrying webhooks do not appear here.
        </p>
      </div>
    );
  }

  const data = deliveriesTs.map((d, i) => ({
    label: d.ts ? new Date(d.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : i,
    deliveries: d.deliveries ?? 0,
    latency: latencyTs[i]?.latency_ms ?? 0,
  }));

  return (
    <div className="h-[360px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="deliveries"
            name="Deliveries"
            stroke="#000000"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="latency"
            name="Latency"
            stroke="#14B8A6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
