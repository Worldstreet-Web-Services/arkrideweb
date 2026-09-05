import Link from "next/link";
import { notFound } from "next/navigation";
import { TripTracker } from "@/components/app/TripTracker";
import { getRide, type Ride } from "@/lib/api/rides";
import { requireRider } from "@/lib/api/guards";
import { ApiError } from "@/lib/api/types";

/**
 * The fetch is wrapped, the render is not.
 *
 * JSX constructed inside a try/catch is not protected by it — React renders
 * the element later, long after the block has exited, so a render error
 * escapes to the error boundary regardless. Only the await belongs in there.
 */
async function loadRide(id: string): Promise<Ride> {
  try {
    return await getRide(id);
  } catch (error) {
    // 404 for missing, 403 for someone else's. Both are "not yours to see",
    // and distinguishing them would confirm the ride exists.
    if (
      error instanceof ApiError &&
      (error.statusCode === 404 || error.statusCode === 403)
    ) {
      notFound();
    }
    throw error;
  }
}

export default async function RiderTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }] = await Promise.all([params, requireRider("/app/rides")]);
  const ride = await loadRide(id);

  return (
    <div>
      <Link
        href="/app/rides"
        className="rounded-pill text-sm font-semibold text-text-muted underline underline-offset-4 transition hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        &larr; All trips
      </Link>
      <div className="mt-4">
        <TripTracker ride={ride} />
      </div>
    </div>
  );
}
