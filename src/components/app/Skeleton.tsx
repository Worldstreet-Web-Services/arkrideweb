/**
 * Loading placeholders.
 *
 * Every authenticated page is a Server Component that awaits the API before
 * returning a byte, and there was no `loading.tsx` anywhere — so App Router
 * navigation blocked on the OLD page with no feedback at all. Tapping "Trips"
 * did nothing visible until the API answered. On Lagos mobile data that reads
 * as a broken button, not a slow one.
 *
 * These mirror the shape of what is coming, so the layout does not jump when
 * the real content lands.
 */
export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse rounded-md bg-surface-sunken ${className}`}
    />
  );
}

/** Matches `RideCard` — same padding, radius and internal rhythm. */
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <SkeletonLine className="h-6 w-28 rounded-pill" />
        <SkeletonLine className="h-5 w-16" />
      </div>
      <div className="mt-3.5 grid gap-2">
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-4 w-2/3" />
      </div>
      <SkeletonLine className="mt-3.5 h-3 w-40" />
    </div>
  );
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="grid gap-2.5">
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
