export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-14 text-[var(--muted)]" role="status">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--accent)]" />
      {label}
    </div>
  );
}
