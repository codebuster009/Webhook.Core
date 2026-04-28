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
