export default function AttemptHistoryTable({ attempts = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            {[
              'Attempt #',
              'Timestamp',
              'Response',
              'Latency',
              'Outcome',
              'Backoff',
            ].map((h) => (
              <th key={h} className="px-4 py-2 font-mono text-[11px] uppercase text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {attempts.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-3 font-mono text-xs">{a.attempt_number}</td>
              <td className="px-4 py-3 font-mono text-xs">
                {a.started_at ? new Date(a.started_at).toLocaleString() : '—'}
              </td>
              <td
                className={`px-4 py-3 font-mono text-xs ${
                  a.response_code >= 400 ? 'text-error font-semibold' : ''
                }`}
              >
                {a.response_code != null ? (
                  a.response_code
                ) : a.error_message ? (
                  <span className="text-error" title={a.error_message}>
                    {a.error_message}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3 font-mono text-xs">{a.latency_ms ?? '—'}ms</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                    a.outcome === 'terminated'
                      ? 'bg-red-50 text-error'
                      : a.outcome === 'retry'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {a.outcome}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted">—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
