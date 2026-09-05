"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acceptRideAction,
  driverAdvanceAction,
  driverCancelAction,
  setOnlineAction,
} from "@/app/actions/rides";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  formatNaira,
  type Ride,
  type RideStatus,
} from "@/lib/api/ride-model";
import type { AdminDriver } from "@/lib/api/admin";

/**
 * The driver's working screen.
 *
 * Three states, and only one is ever shown: not yet approved, online with a
 * ride, or online and waiting. Rendering the pool beside an active ride would
 * invite a driver to accept a second one, which the API refuses anyway.
 *
 * Polls the pool at 15s while online and free. Same reasoning as the rider's
 * tracker: the websocket gateway exists but needs the raw token in its
 * handshake, and the token is in an httpOnly cookie on purpose.
 */
const POLL_MS = 15_000;

/** What the driver does next, given where the ride is. */
const NEXT_STEP: Partial<
  Record<RideStatus, { to: "arrived" | "in_progress" | "completed"; label: string }>
> = {
  accepted: { to: "arrived", label: "I've arrived" },
  arrived: { to: "in_progress", label: "Start trip" },
  in_progress: { to: "completed", label: "Complete trip" },
};

export function DriverConsole({
  driver,
  current,
  pool,
  poolError,
  completedToday,
}: {
  driver: AdminDriver;
  current: Ride | null;
  pool: Ride[];
  poolError: string | null;
  completedToday: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const approved = driver.verificationStatus === "approved" && driver.isActive;
  // The vehicle the driver is out in. The API records it on the ride, so a
  // rider sees the plate that actually turns up.
  const vehicleId = driver.vehicles?.[0]?.id ?? "";
  const waiting = approved && driver.isOnline && !current;

  useEffect(() => {
    if (!waiting) return;
    // `router` is stable across renders in the App Router, so this interval
    // is created once per state change rather than on every render.
    const timer = setInterval(() => router.refresh(), POLL_MS);
    return () => clearInterval(timer);
  }, [waiting, router]);

  const run = (fn: () => Promise<{ error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  /* ---------------------------------------------------------- not approved */

  if (!approved) {
    return (
      <div className="grid gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">
          Hello, {driver.name?.split(" ")[0] ?? "there"}
        </h1>

        <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
          {driver.verificationStatus === "rejected" ? (
            <>
              <p className="text-[15px] font-bold text-danger">
                Your application was not approved
              </p>
              <p className="mt-1.5 text-sm text-text-muted">
                Contact the Arkride team to find out what to do next.
              </p>
            </>
          ) : !driver.isActive ? (
            <>
              <p className="text-[15px] font-bold text-danger">
                Your account is suspended
              </p>
              <p className="mt-1.5 text-sm text-text-muted">
                You cannot go online while your account is suspended. Contact
                the Arkride team.
              </p>
            </>
          ) : (
            <>
              <p className="text-[15px] font-bold text-text">
                Verification in progress
              </p>
              <p className="mt-1.5 text-sm text-text-muted">
                Our team is reviewing your details. You&rsquo;ll be able to go
                online as soon as you&rsquo;re approved.
              </p>
              {/*
                The KYC portal collects the documents the reviewer needs. It is
                a separate flow because the API has no endpoint to attach them
                to a driver record yet.
              */}
              <a
                href="/verify"
                className="mt-4 inline-grid h-12 place-items-center rounded-pill bg-primary px-6 text-[15px] font-bold text-on-primary shadow-primary transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Complete verification
              </a>
            </>
          )}
        </section>

        <DriverFacts driver={driver} completed={completedToday} />
      </div>
    );
  }

  /* ------------------------------------------------------------- approved */

  return (
    <div className="grid gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text">
            Hello, {driver.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-1 text-[15px] text-text-muted">
            {driver.isOnline ? "You're online." : "You're offline."}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={driver.isOnline}
          disabled={pending || Boolean(current)}
          onClick={() => run(() => setOnlineAction(!driver.isOnline))}
          className={`inline-flex h-11 shrink-0 items-center gap-2.5 rounded-pill px-4 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 ${
            driver.isOnline
              ? "bg-primary text-on-primary shadow-primary"
              : "border border-border text-text"
          }`}
        >
          <span
            aria-hidden
            className={`size-2.5 rounded-full ${
              driver.isOnline ? "bg-on-primary" : "bg-text-subtle"
            }`}
          />
          {driver.isOnline ? "Online" : "Go online"}
        </button>
      </div>

      <div role="alert" className="empty:hidden">
        {error && (
          <p className="rounded-2xl border border-danger-border bg-danger-tint px-4 py-3 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>

      {current ? (
        <section className="rounded-3xl border border-primary bg-surface p-5 shadow-sm">
          <p role="status" aria-live="polite" className="text-sm font-bold uppercase tracking-wide text-primary-ink">
            {STATUS_LABELS[current.status]}
          </p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-text">
            {formatNaira(current.fare ?? current.estimatedFare)}
          </p>

          <div className="mt-5 grid gap-2.5 border-t border-border pt-5">
            <RoutePoint label="Pick up" address={current.pickup?.address} />
            <RoutePoint label="Drop off" address={current.dropoff?.address} accent />
          </div>

          {current.user && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-surface-sunken px-3.5 py-3">
              <span className="text-sm font-medium text-text">
                {current.user.name}
              </span>
              {current.user.phone && (
                <a
                  href={`tel:${current.user.phone}`}
                  className="rounded-pill border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-text"
                >
                  Call rider
                </a>
              )}
            </div>
          )}

          <div className="mt-5 grid gap-2.5">
            {NEXT_STEP[current.status] && (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  run(() =>
                    driverAdvanceAction(current.id, NEXT_STEP[current.status]!.to),
                  )
                }
                className="h-12 rounded-pill bg-primary text-[15px] font-bold text-on-primary shadow-primary transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
              >
                {pending ? "Working…" : NEXT_STEP[current.status]!.label}
              </button>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => driverCancelAction(current.id))}
              className="h-12 rounded-pill border border-border px-5 text-[15px] font-semibold text-text transition hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
            >
              Cancel ride
            </button>
          </div>
        </section>
      ) : driver.isOnline ? (
        <section>
          <h2 className="text-lg font-bold text-text">Available rides</h2>
          <p className="mt-1 text-sm text-text-muted">
            Refreshing every 15 seconds.
          </p>

          {poolError && (
            <p role="status" className="mt-4 rounded-2xl border border-warning/30 bg-warning-tint px-4 py-3 text-sm font-medium text-text">
              {poolError}
            </p>
          )}

          {pool.length === 0 && !poolError ? (
            <p className="mt-4 rounded-2xl border border-border bg-surface px-4 py-8 text-center text-sm text-text-muted">
              No rides waiting right now. Stay online and we&rsquo;ll show them
              here.
            </p>
          ) : (
            <ul className="mt-4 grid gap-2.5">
              {pool.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-semibold text-text-muted">
                      {CATEGORY_LABELS[r.category] ?? r.category}
                      {r.distanceKm ? ` · ${r.distanceKm.toFixed(1)} km` : ""}
                    </span>
                    <span className="shrink-0 text-[15px] font-bold text-text">
                      {formatNaira(r.fare ?? r.estimatedFare)}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2">
                    <RoutePoint label="Pick up" address={r.pickup?.address} />
                    <RoutePoint label="Drop off" address={r.dropoff?.address} accent />
                  </div>

                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => acceptRideAction(r.id, vehicleId))}
                    className="mt-4 h-11 w-full rounded-pill bg-primary text-sm font-bold text-on-primary shadow-primary transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
                  >
                    Accept
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="rounded-3xl border border-border bg-surface px-5 py-10 text-center shadow-sm">
          <p className="text-[15px] font-semibold text-text">
            You&rsquo;re offline
          </p>
          <p className="mt-1.5 text-sm text-text-muted">
            Go online to start receiving ride requests.
          </p>
        </section>
      )}

      <DriverFacts driver={driver} completed={completedToday} />
    </div>
  );
}

function RoutePoint({
  label,
  address,
  accent = false,
}: {
  label: string;
  address?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={`mt-1.5 size-2 shrink-0 rounded-full ${
          accent ? "bg-primary" : "bg-text-subtle"
        }`}
        aria-hidden
      />
      <span
        className={`min-w-0 flex-1 text-sm ${
          accent ? "font-medium text-text" : "text-text-muted"
        }`}
      >
        <span className="sr-only">{label}: </span>
        {address ?? "—"}
      </span>
    </div>
  );
}

function DriverFacts({
  driver,
  completed,
}: {
  driver: AdminDriver;
  completed: number;
}) {
  const vehicle = driver.vehicles?.[0];

  return (
    <section className="grid gap-2.5 sm:grid-cols-3">
      <Fact label="Completed trips" value={String(completed)} />
      <Fact
        label="Rating"
        value={driver.ratingAverage ? `${driver.ratingAverage.toFixed(1)} ★` : "—"}
      />
      <Fact label="Vehicle" value={vehicle ? vehicle.plateNumber : "—"} />
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-3.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-text">{value}</p>
    </div>
  );
}
