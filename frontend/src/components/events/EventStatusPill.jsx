import clsx from 'clsx';
import { STATUS_PILL_CLASS } from '../../lib/constants.js';

function formatStatus(status) {
  if (!status) return '';
  return String(status).replace(/_/g, ' ').toUpperCase();
}

export default function EventStatusPill({ status }) {
  const cls = STATUS_PILL_CLASS[status] || STATUS_PILL_CLASS.pending;
  return (
    <span
      className={clsx(
        'inline-flex rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase',
        cls
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
