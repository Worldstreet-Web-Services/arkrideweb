import Link from "next/link";
import { BookRide } from "@/components/app/BookRide";
import { RideCard } from "@/components/app/RideCard";
import { getRiderRides, isActive } from "@/lib/api/rides";
import { requireRider } from "@/lib/api/guards";
import { ApiError } from "@/lib/api/types";
import type { Ride } from "@/lib/api/rides";

/**
 * Rider home.
 *
 * An active ride takes over the page — someone with a driver on the way is not
 * looking to book a second one, and burying the live trip under a booking form
 * is how you get people cancelling because they cannot find it.
 */
export default async function RiderHome() {
  const principal = await requireRider("/app");

  let rides: Ride[] = [];
  let loadError: string | null = null;

  try {
    rides = await getRiderRides(principal.id);
  } catch (error) {
    // A failed history load must not stop someone booking — that is the one
    // thing this page has to do.
    loadError =
      error instanceof ApiError
        ? error.message
        : "We couldn't load your trips.";
  }

  const active = rides.find((r) => isActive(r.status));
  const recent = rides.filter((r) => !isActive(r.status)).slice(0, 3);

  return (
    <div className="grid gap-6">
      {active ? (
        <section>
          <h1 className="text-2xl font-extrabold tracking-tight text-text">
            Your ride
          </h1>
          <p className="mt-1 text-[15px] text-text-muted">
            You have a trip in progress.
          </p>
          <div className="mt-4">
            <RideCard ride={active} href={`/app/rides/${active.id}`} />
          </div>
        </section>
      ) : (
        <BookRide />
      )}

      {loadError && (
        <p
          role="status"
          className="rounded-2xl border border-warning/30 bg-warning-tint px-4 py-3 text-sm font-medium text-text"
        >
          {loadError}
        </p>
      )}

      {recent.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-bold text-text">Recent trips</h2>
            <Link
              href="/app/rides"
              className="rounded-pill text-sm font-semibold text-text-muted underline underline-offset-4 transition hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              See all
            </Link>
          </div>
          <div className="mt-3 grid gap-2.5">
            {recent.map((r) => (
              <RideCard key={r.id} ride={r} href={`/app/rides/${r.id}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
