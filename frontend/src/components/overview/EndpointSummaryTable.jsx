import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function EndpointSummaryTable({ rows = [] }) {
  const [range, setRange] = useState('24h');
  const navigate = useNavigate();
  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-200 bg-white"
      data-tour="overview-endpoints"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
        <h2 className="text-lg font-semibold">Endpoint Monitoring Summary</h2>
        <div className="flex rounded-lg bg-gray-50 p-1">
          <button
            type="button"
            className={`rounded-md px-4 py-1.5 text-[11px] font-bold uppercase ${
              range === '24h' ? 'bg-white shadow-sm' : 'text-muted hover:bg-gray-100'
            }`}
            onClick={() => setRange('24h')}
          >
            Last 24h
          </button>
          <button
            type="button"
            className={`rounded-md px-4 py-1.5 text-[11px] font-bold uppercase ${
              range === '7d' ? 'bg-white shadow-sm' : 'text-muted hover:bg-gray-100'
            }`}
            onClick={() => setRange('7d')}
          >
            Last 7d
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {[
                'Endpoint Name',
                'Total Volume',
                'Uptime',
                'Avg Latency',
                'Error Rate',
                'Actions',
              ].map((h) => (
                <th key={h} className="px-6 py-2 font-mono text-[11px] uppercase text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((r) => {
              const bad = r.uptime_pct < 99;
              return (
                <tr key={r.partner_id} className="group hover:bg-canvas/80">
                  <td className="px-6 py-3 font-medium">{r.endpoint_key}</td>
                  <td className="px-6 py-3 font-mono text-xs">{r.total_volume}</td>
                  <td className={`px-6 py-3 font-bold ${bad ? 'text-error' : 'text-accent'}`}>
                    {r.uptime_pct}%
                  </td>
                  <td className="px-6 py-3 font-mono text-xs">{r.avg_latency_ms}ms</td>
                  <td
                    className={`px-6 py-3 ${r.error_rate_pct > 0 ? 'text-error' : 'text-muted'}`}
                  >
                    {r.error_rate_pct}%
                  </td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/events?partner_id=${encodeURIComponent(r.partner_id)}`)}
                      className="text-xs font-medium text-accent underline-offset-2 hover:underline"
                    >
                      VIEW LOGS
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
