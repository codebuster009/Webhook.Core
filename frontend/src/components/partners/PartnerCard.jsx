import { Button } from '../ui/Button.jsx';
import { ExternalLink } from 'lucide-react';
import { truncateMiddle } from '../../lib/format.js';

export default function PartnerCard({
  partner,
  onEdit,
  onTest,
  onViewEvents,
}) {
  const disabled = partner.status === 'disabled';
  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${disabled ? 'bg-red-500' : 'bg-emerald-500'}`}
            />
            <span className="text-xs font-mono uppercase text-muted">{partner.status}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold">{partner.name}</h3>
        </div>
      </div>
      <div className="mt-3 rounded-md bg-gray-50 px-3 py-2 font-mono text-xs text-muted">
        {truncateMiddle(partner.webhookUrl, 40)}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
        <div>
          <div className="text-muted">Events</div>
          <div className="font-semibold">—</div>
        </div>
        <div>
          <div className="text-muted">Success</div>
          <div className="font-semibold text-accent">—</div>
        </div>
        <div>
          <div className="text-muted">Latency</div>
          <div className="font-semibold">—</div>
        </div>
      </div>
      <div className="mt-4 text-xs text-muted">Last delivery: —</div>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <button
          type="button"
          className="text-xs font-medium text-accent hover:underline"
          onClick={onViewEvents}
        >
          View Events
        </button>
        <Button variant="secondary" className="!px-3 !py-1 text-xs" type="button" onClick={onTest}>
          Send Test
        </Button>
        <Button className="!px-3 !py-1 text-xs" type="button" onClick={onEdit}>
          Edit
        </Button>
        <a
          className="ml-auto inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
          href={partner.webhookUrl}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
