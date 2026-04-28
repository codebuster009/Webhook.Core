import { Check, Minus } from 'lucide-react';
import clsx from 'clsx';

/**
 * Delivery signature line: green when the latest HTTP attempt returned 2xx.
 */
export default function SignatureDeliveryBadge({ latestAttempt }) {
  const code = latestAttempt?.response_code;
  const ok =
    typeof code === 'number' && code >= 200 && code < 300;

  if (latestAttempt == null) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-6 text-center">
        <Minus className="h-10 w-10 text-gray-300" strokeWidth={2.5} />
        <span className="font-mono text-2xl font-semibold text-gray-400">—</span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          No delivery response yet
        </span>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-2 rounded-lg border bg-white p-6 text-center',
        ok ? 'border-green-200' : 'border-gray-200'
      )}
    >
      <div
        className={clsx(
          'flex h-12 w-12 items-center justify-center rounded-full',
          ok ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
        )}
      >
        {ok ? <Check className="h-7 w-7" strokeWidth={2.5} /> : <Minus className="h-7 w-7" />}
      </div>
      <span
        className={clsx(
          'text-xs font-semibold uppercase tracking-wide',
          ok ? 'text-green-800' : 'text-muted'
        )}
      >
        {ok ? 'SIGNATURE VERIFIED' : '—'}
      </span>
      {!ok ? (
        <span className="font-mono text-[10px] text-muted">
          Last HTTP {code ?? '—'}
        </span>
      ) : null}
    </div>
  );
}
