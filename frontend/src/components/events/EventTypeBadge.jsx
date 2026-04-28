import clsx from 'clsx';
import { EVENT_TYPE_BADGE } from '../../lib/constants.js';

export default function EventTypeBadge({ type }) {
  const cls = EVENT_TYPE_BADGE[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  return (
    <span className={clsx('rounded border px-2 py-0.5 font-mono text-[11px] font-semibold', cls)}>
      {type}
    </span>
  );
}
