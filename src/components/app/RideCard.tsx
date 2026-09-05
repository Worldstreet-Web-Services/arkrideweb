import Link from "next/link";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  formatNaira,
  isActive,
  type Ride,
} from "@/lib/api/ride-model";

const STATUS_TONE: Record<string, string> = {
  requested: "bg-warning-tint text-text",
  accepted: "bg-info-tint text-info-strong",
  arrived: "bg-info-tint text-info-strong",
  in_progress: "bg-primary/15 text-text",
  completed: "bg-success-tint text-success-strong",
  cancelled: "bg-surface-sunken text-text-muted",
};

/** One trip, in a list. */
export function RideCard({ ride, href }: { ride: Ride; href: string }) {
  const live = isActive(ride.status);

  return (
    <Link
      href={href}
      className="block rounded-2xl border border-border bg-surface p-4 transition hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-pill px-2.5 py-1 text-xs font-semibold ${
            STATUS_TONE[ride.status] ?? "bg-surface-sunken text-text-muted"
          }`}
        >
          {STATUS_LABELS[ride.status] ?? ride.status}
        </span>
        <span className="shrink-0 text-[15px] font-bold text-text">
          {formatNaira(ride.fare ?? ride.estimatedFare)}
        </span>
      </div>

      {/*
        The two endpoints as a route, with the connector drawn rather than
        written — a bullet list of two addresses reads as unrelated items.
      */}
      <div className="mt-3.5 grid gap-2">
        <div className="flex items-start gap-2.5">
          <span
            className="mt-1.5 size-2 shrink-0 rounded-full bg-text-subtle"
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate text-sm text-text-muted">
            <span className="sr-only">From: </span>
            {ride.pickup?.address ?? "—"}
          </span>
        </div>
        <div className="flex items-start gap-2.5">
          <span
            className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
            <span className="sr-only">To: </span>
            {ride.dropoff?.address ?? "—"}
          </span>
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2 text-xs text-text-subtle">
        <span>{CATEGORY_LABELS[ride.category] ?? ride.category}</span>
        <span aria-hidden>·</span>
        <time dateTime={ride.createdAt}>
          {new Date(ride.createdAt).toLocaleString("en-NG", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
        {live && (
          <>
            <span aria-hidden>·</span>
            <span className="font-semibold text-primary-ink">Live</span>
          </>
        )}
      </div>
    </Link>
  );
}
