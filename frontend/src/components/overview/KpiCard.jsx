export default function KpiCard({ label, children, tone = 'neutral' }) {
  const border =
    tone === 'danger'
      ? 'border-error bg-red-50/30'
      : 'border-gray-200 bg-white';
  const labelTone = tone === 'danger' ? 'text-error' : 'text-muted';
  return (
    <div
      className={`rounded-lg border p-6 shadow-sm transition-shadow duration-200 ease-out hover:shadow-md ${border}`}
    >
      <span className={`font-mono text-[11px] uppercase tracking-wider ${labelTone}`}>
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </div>
  );
}
