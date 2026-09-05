"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelRideAction, rateRideAction, sosAction } from "@/app/actions/rides";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  formatNaira,
  isActive,
  type Ride,
} from "@/lib/api/ride-model";

/**
 * Live view of one trip.
 *
 * POLLING, AND WHY IT IS SLOW
 *
 * The backend has a Socket.IO gateway that pushes ride events, and that is the
 * right transport for this — but it needs the raw access token in the
 * handshake, and this app deliberately keeps the token in an httpOnly cookie
 * the browser cannot read. Wiring the socket properly means a server-issued
 * short-lived socket ticket, which is backend work that does not exist yet.
 *
 * So this polls, at 12 seconds. That number is not arbitrary: the API allows
 * 120 requests a minute across everything, and a 1-second poll would exhaust a
 * rider's whole budget in two minutes and start 429ing their other actions.
 * Polling stops entirely once the ride reaches a terminal state.
 */
const POLL_MS = 12_000;

/**
 * `ride` is read straight from props rather than mirrored into state.
 *
 * Copying a prop into state and syncing it back in an effect renders the stale
 * value first and the fresh one a frame later. There is nothing to sync here:
 * `router.refresh()` re-runs the Server Component and React hands this a new
 * `ride` prop, which is exactly the update the state copy was chasing.
 */
export function TripTracker({ ride }: { ride: Ride }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirmingSos, setConfirmingSos] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const live = isActive(ride.status);

  useEffect(() => {
    if (!live) return;
    // `router` is stable across renders in the App Router, so this interval
    // is created once per state change rather than on every render.
    const timer = setInterval(() => router.refresh(), POLL_MS);
    return () => clearInterval(timer);
  }, [live, router]);

  const cancel = () => {
    setError(null);
    startTransition(async () => {
      const result = await cancelRideAction(ride.id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  const sendSos = () => {
    setError(null);
    startTransition(async () => {
      const result = await sosAction(ride.id);
      if (result.error) setError(result.error);
      else {
        setSosSent(true);
        setConfirmingSos(false);
      }
    });
  };

  const driver = ride.driver;

  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        {/*
          The status is the single most important thing here, and it changes
          without user action — so it is announced.
        */}
        <p role="status" aria-live="polite" className="text-sm font-bold uppercase tracking-wide text-primary-ink">
          {STATUS_LABELS[ride.status] ?? ride.status}
        </p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-text">
          {formatNaira(ride.fare ?? ride.estimatedFare)}
        </p>
        <p className="mt-0.5 text-sm text-text-muted">
          {CATEGORY_LABELS[ride.category] ?? ride.category}
          {ride.distanceKm ? ` · ${ride.distanceKm.toFixed(1)} km` : ""}
        </p>

        <div className="mt-5 grid gap-2.5 border-t border-border pt-5">
          <div className="flex items-start gap-2.5">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-text-subtle" aria-hidden />
            <span className="text-sm text-text-muted">
              <span className="sr-only">From: </span>
              {ride.pickup?.address}
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
            <span className="text-sm font-medium text-text">
              <span className="sr-only">To: </span>
              {ride.dropoff?.address}
            </span>
          </div>
        </div>
      </section>

      {driver && (
        <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-text-subtle">
            Your driver
          </h2>
          <div className="mt-3 flex items-center gap-3.5">
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-inverse text-sm font-bold text-on-inverse"
            >
              {driver.name?.slice(0, 1).toUpperCase() ?? "D"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-text">
                {driver.name}
              </p>
              <p className="text-xs text-text-muted">
                {driver.ratingAverage
                  ? `${driver.ratingAverage.toFixed(1)} ★`
                  : "New driver"}
                {driver.totalCompletedRides
                  ? ` · ${driver.totalCompletedRides} trips`
                  : ""}
              </p>
            </div>
            {driver.phone && (
              <a
                href={`tel:${driver.phone}`}
                className="shrink-0 rounded-pill border border-border px-4 py-2 text-sm font-semibold text-text transition hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Call
              </a>
            )}
          </div>

          {ride.vehicle && (
            <p className="mt-3.5 rounded-2xl bg-surface-sunken px-3.5 py-2.5 text-sm text-text-muted">
              {ride.vehicle.color} {ride.vehicle.model} ·{" "}
              <span className="font-semibold text-text">
                {ride.vehicle.plateNumber}
              </span>
            </p>
          )}
        </section>
      )}

      <div role="alert" className="empty:hidden">
        {error && (
          <p className="rounded-2xl border border-danger-border bg-danger-tint px-4 py-3 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>

      {sosSent && (
        <p
          role="status"
          className="rounded-2xl border border-danger-border bg-danger-tint px-4 py-3 text-sm font-medium text-danger"
        >
          Emergency alert sent. Our team has been notified.
        </p>
      )}

      {live && (
        <section className="grid gap-2.5">
          <button
            type="button"
            onClick={cancel}
            disabled={pending}
            className="h-12 rounded-pill border border-border px-5 text-[15px] font-semibold text-text transition hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
          >
            Cancel this ride
          </button>

          {/*
            Two-step, so a pocket press cannot raise a real emergency — but
            once confirmed it fires immediately, with no further round trip.
          */}
          {!sosSent &&
            (confirmingSos ? (
              <div className="grid gap-2 rounded-2xl border border-danger-border bg-danger-tint p-3.5">
                <p className="text-sm font-medium text-danger">
                  This alerts the Arkride safety team straight away. Continue?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingSos(false)}
                    className="h-11 flex-1 rounded-pill border border-border bg-surface text-sm font-semibold text-text"
                  >
                    Not now
                  </button>
                  <button
                    type="button"
                    onClick={sendSos}
                    disabled={pending}
                    className="h-11 flex-1 rounded-pill bg-danger text-sm font-bold text-white disabled:opacity-60"
                  >
                    {pending ? "Sending…" : "Send alert"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingSos(true)}
                className="h-12 rounded-pill border border-danger-border px-5 text-[15px] font-bold text-danger transition hover:bg-danger-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
              >
                Emergency
              </button>
            ))}
        </section>
      )}

      {ride.status === "completed" && <RateTrip rideId={ride.id} />}
    </div>
  );
}

/** Rate a finished trip. One submission; the API rejects a second. */
function RateTrip({ rideId }: { rideId: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p
        role="status"
        className="rounded-2xl border border-success-border bg-success-tint px-4 py-3 text-sm font-medium text-success-strong"
      >
        Thanks for rating this trip.
      </p>
    );
  }

  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="text-lg font-bold text-text">How was your trip?</h2>

      <div role="radiogroup" aria-label="Rating out of 5" className="mt-3.5 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={n}
              checked={rating === n}
              onChange={() => setRating(n)}
              className="peer sr-only"
            />
            <span
              className={`grid size-11 place-items-center rounded-full border text-lg transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
                n <= rating
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border-input text-text-subtle"
              }`}
            >
              <span aria-hidden>★</span>
              <span className="sr-only">
                {n} star{n === 1 ? "" : "s"}
              </span>
            </span>
          </label>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Anything you'd like to add? (optional)"
        aria-label="Comment about this trip"
        className="mt-3.5 min-h-20 w-full resize-y rounded-2xl border border-border-input bg-surface px-4 py-3 text-base text-text outline-none transition placeholder:text-text-placeholder focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/25"
      />

      <div role="alert" className="empty:hidden">
        {error && (
          <p className="mt-3 text-sm font-medium text-danger">{error}</p>
        )}
      </div>

      <button
        type="button"
        disabled={rating === 0 || pending}
        onClick={() =>
          startTransition(async () => {
            const result = await rateRideAction(rideId, rating, comment);
            if (result.error) setError(result.error);
            else setDone(true);
          })
        }
        className="mt-4 h-12 w-full rounded-pill bg-primary text-[15px] font-bold text-on-primary shadow-primary transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-surface-disabled disabled:text-text-disabled disabled:shadow-none"
      >
        {pending ? "Sending…" : "Submit rating"}
      </button>
    </section>
  );
}
