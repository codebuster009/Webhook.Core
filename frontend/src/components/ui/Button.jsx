import clsx from 'clsx';

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}) {
  const styles = {
    primary: 'bg-black text-white hover:opacity-90',
    secondary:
      'border border-accent text-accent bg-white hover:bg-gray-50',
    /** For actions on dark panels (e.g. #0B0B0F) — never pair `secondary` with `!text-white` (invisible on white). */
    onDark:
      'border border-white/35 bg-white/10 text-white shadow-sm hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50',
    ghost: 'text-muted hover:text-ink',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition',
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
