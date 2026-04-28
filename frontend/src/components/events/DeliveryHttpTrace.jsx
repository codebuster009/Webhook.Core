function HeaderPre({ title, data }) {
  const empty =
    data == null ||
    (typeof data === 'object' && data !== null && Object.keys(data).length === 0);
  return (
    <div>
      <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wide text-muted">
        {title}
      </div>
      {empty ? (
        <p className="text-xs text-muted">—</p>
      ) : (
        <pre className="max-h-48 overflow-auto rounded-md border border-gray-100 bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-ink">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function DeliveryHttpTrace({ attempts = [] }) {
  const sorted = [...attempts].sort((a, b) => a.attempt_number - b.attempt_number);
  const anyCaptured = sorted.some(
    (a) =>
      (a.request_headers && Object.keys(a.request_headers).length > 0) ||
      (a.response_headers && Object.keys(a.response_headers).length > 0)
  );

  return (
    <div className="border-t border-gray-100 px-4 py-3">
      {!anyCaptured && sorted.length > 0 ? (
        <p className="mb-4 text-xs text-muted">
          Request and response headers are captured for delivery attempts recorded after the HTTP trace
          upgrade. Older attempts show status and body only in the table above.
        </p>
      ) : null}
      <div className="space-y-6">
        {sorted.map((a) => (
          <div key={a.id} className="space-y-3 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
            <div className="font-mono text-xs font-semibold text-ink">
              Attempt {a.attempt_number}
              {a.response_code != null ? (
                <span className="ml-2 text-muted">· HTTP {a.response_code}</span>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <HeaderPre title="Outbound request headers" data={a.request_headers} />
              <HeaderPre title="Partner response headers" data={a.response_headers} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
