import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  formatNaira,
  getRide,
} from "@/lib/api/rides";
import { requireDriver } from "@/lib/api/guards";
import { ApiError } from "@/lib/api/types";

/** The fetch is wrapped; the render is not. See the rider page for why. */
async function loadRide(id: string) {
  try {
    return await getRide(id);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.statusCode === 404 || error.statusCode === 403)
    ) {
      notFound();
    }
    throw error;
  }
}

export default async function DriverTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }] = await Promise.all([params, requireDriver("/driver/trips")]);
  const ride = await loadRide(id);

  return (
      <div>
        <Link
          href="/driver/trips"
          className="rounded-pill text-sm font-semibold text-text-muted underline underline-offset-4 transition hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          &larr; All trips
        </Link>

        <section className="mt-4 rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-primary-ink">
            {STATUS_LABELS[ride.status] ?? ride.status}
          </p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-text">
            {formatNaira(ride.fare ?? ride.estimatedFare)}
          </p>
          <p className="mt-0.5 text-sm text-text-muted">
            {CATEGORY_LABELS[ride.category] ?? ride.category}
            {ride.distanceKm ? ` · ${ride.distanceKm.toFixed(1)} km` : ""}
          </p>

          <dl className="mt-5 grid gap-3 border-t border-border pt-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                Pick up
              </dt>
              <dd className="mt-0.5 text-sm text-text">{ride.pickup?.address}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                Drop off
              </dt>
              <dd className="mt-0.5 text-sm text-text">{ride.dropoff?.address}</dd>
            </div>
            {ride.user && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                  Rider
                </dt>
                <dd className="mt-0.5 text-sm text-text">{ride.user.name}</dd>
              </div>
            )}
            {ride.cancellationReason && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                  Cancellation reason
                </dt>
                <dd className="mt-0.5 text-sm text-text">
                  {ride.cancellationReason}
                </dd>
              </div>
            )}
          </dl>
        </section>
    </div>
  );
}
