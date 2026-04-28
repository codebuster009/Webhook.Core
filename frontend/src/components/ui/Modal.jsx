import clsx from 'clsx';

export function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={clsx(
          'w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-xl',
          'flex max-h-[90vh] flex-col'
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="font-semibold text-ink">{title}</h2>
          <button
            type="button"
            className="text-muted hover:text-ink"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-3">{children}</div>
        {footer ? (
          <div className="border-t border-gray-100 px-4 py-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
