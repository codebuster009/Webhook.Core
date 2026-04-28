export function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      {Icon ? (
        <Icon className="mx-auto mb-4 h-12 w-12 text-gray-300" strokeWidth={1.25} aria-hidden />
      ) : null}
      <p className="text-lg font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
