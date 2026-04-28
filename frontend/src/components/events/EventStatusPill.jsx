import clsx from 'clsx';
import { STATUS_STYLE } from '../../lib/constants.js';

export default function EventStatusPill({ status }) {
  const st = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs uppercase">
      <span className={clsx('h-2 w-2 rounded-full', st.dot)} />
      <span className={clsx(st.text)}>{status}</span>
    </span>
  );
}
