import "server-only";

import { apiFetch } from "./client";
import type {
  Ride,
  RideWire,
  RideCategory,
  RideLocation,
  RideOption,
  NearbyDriver,
  FareBreakdown,
} from "./ride-model";
import { toNumber } from "./ride-model";

/**
 * Coerce one ride off the wire.
 *
 * Every function below funnels through this, so no component ever sees a
 * numeric string. Doing it here rather than at each call site is the whole
 * point — a single missed coercion is a `.toFixed is not a function` in
 * production.
 */
function normalizeRide(wire: RideWire): Ride {
  const estimatedFare = toNumber(wire.estimatedFare);
  const finalFare = toNumber(wire.finalFare);

  // The embedded driver carries its own numerics. Missing these was a 500 on
  // the rider's trip page the moment a driver accepted.
  const rating = wire.driver
    ? toNumber(wire.driver.ratingAverage as string | number | null | undefined)
    : null;

  return {
    ...wire,
    distanceKm: toNumber(wire.distanceKm),
    estimatedFare,
    finalFare,
    // The settled fare once there is one, the estimate until then.
    fare: finalFare ?? estimatedFare,
    driver: wire.driver
      ? {
          ...wire.driver,
          // Zero means "never rated", and "0.0 ★" beside a new driver reads
          // worse than no rating at all.
          ratingAverage: rating && rating > 0 ? rating : null,
        }
      : wire.driver,
  };
}

/**
 * Rides — the rider side and the driver side.
 *
 * The two share a resource but not a permission model: a rider may only touch
 * their own rides, a driver only rides they hold, and the API enforces both.
 * Nothing here re-checks that; it would duplicate a decision the server
 * already makes, and duplicated authorisation is authorisation that drifts.
 *
 * Types, status labels and `formatNaira` live in `ride-model.ts` rather than
 * here, because client components need them and this module is `server-only`.
 * Re-exported below so callers have one import path.
 */
export * from "./ride-model";

/* ------------------------------------------------------------------ riders */

/**
 * Price the trip.
 *
 * Requires a rider token — there is no anonymous estimate endpoint, so a fare
 * cannot be shown to a signed-out visitor. That is an API constraint, not a
 * product choice, and it is why the landing page does not offer a quote box.
 */
export async function estimateRide(
  pickup: RideLocation,
  dropoff: RideLocation,
): Promise<RideOption[]> {
  return (
    await apiFetch<RideOption[]>("/rides/estimate", {
      method: "POST",
      body: { pickup, dropoff },
    })
  ).data;
}

/**
 * Book.
 *
 * `userId` is deliberately not sent. The API derives the rider from the token
 * and rejects a mismatched id with a 403 — sending one would be, at best,
 * redundant, and the field exists only for an internal booking channel.
 */
export async function bookRide(input: {
  pickup: RideLocation;
  dropoff: RideLocation;
  category: RideCategory;
}): Promise<Ride> {
  return normalizeRide(
    (await apiFetch<RideWire>("/rides", { method: "POST", body: input })).data,
  );
}

export async function getRide(id: string): Promise<Ride> {
  return normalizeRide(
    (await apiFetch<RideWire>(`/rides/${id}`, { cache: "no-store" })).data,
  );
}

/**
 * A rider's trips, newest first.
 *
 * The endpoint has no pagination and no filters — it returns every ride the
 * rider has ever taken, and its `meta.total` is the array length rather than a
 * count. Fine at current volumes; it will need a backend change before it is
 * not, so the UI slices rather than pretending to page.
 */
export async function getRiderRides(userId: string): Promise<Ride[]> {
  const { data } = await apiFetch<RideWire[]>(`/rides/user/${userId}`, {
    cache: "no-store",
  });
  return data
    .map(normalizeRide)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function cancelRideAsRider(
  id: string,
  cancellationReason?: string,
): Promise<Ride> {
  return normalizeRide(
    (
      await apiFetch<RideWire>(`/rides/${id}/cancel/user`, {
        method: "PATCH",
        body: cancellationReason ? { cancellationReason } : {},
      })
    ).data,
  );
}

export async function getFareBreakdown(id: string): Promise<FareBreakdown> {
  return (await apiFetch<FareBreakdown>(`/rides/${id}/breakdown`)).data;
}

export async function getNearbyDrivers(
  lat: number,
  lng: number,
  radius = 5,
): Promise<NearbyDriver[]> {
  const { data } = await apiFetch<{ drivers: NearbyDriver[] }>(
    `/driver-locations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
    { cache: "no-store" },
  );
  return data.drivers ?? [];
}

/**
 * Rate the other party on a completed ride.
 *
 * The API needs to be told WHO is being rated, not just which ride: `rateeId`
 * plus `rateeType`. A ride has two parties and either may rate the other, so
 * it cannot infer the target from the ride alone.
 */
export async function rateRide(input: {
  rideId: string;
  rateeId: string;
  rateeType: "user" | "driver";
  rating: number;
  comment?: string;
}): Promise<void> {
  await apiFetch("/ratings", { method: "POST", body: input });
}

export async function triggerSos(rideId: string): Promise<void> {
  await apiFetch("/emergency/trigger", { method: "POST", body: { rideId } });
}

/* ----------------------------------------------------------------- drivers */

/** The open request pool a driver can accept from. */
export async function getAvailableRides(): Promise<Ride[]> {
  return (
    await apiFetch<RideWire[]>("/rides/available", { cache: "no-store" })
  ).data.map(normalizeRide);
}

export async function getDriverRides(driverId: string): Promise<Ride[]> {
  const { data } = await apiFetch<RideWire[]>(`/rides/driver/${driverId}`, {
    cache: "no-store",
  });
  return data
    .map(normalizeRide)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * The driver's side of the ride lifecycle.
 *
 * These are strictly ordered by the API — accept, arrived, start, complete —
 * and it rejects a jump. Accepting a ride another driver already took returns
 * a conflict rather than silently reassigning it, which is why the pool page
 * has to handle a failed accept as a normal outcome rather than an error.
 */
/**
 * Accept a ride from the pool.
 *
 * Unlike the other three transitions, this one needs a body: `status` and the
 * `vehicleId` the driver is driving. `vehicleId` is declared optional on the
 * DTO but carries `@IsUUID` with no `@IsOptional`, so omitting it is a 400 —
 * the optionality is a typo in the API, not a real allowance. Sending it
 * explicitly is correct either way, since a driver may own several vehicles
 * and the ride records which one turned up.
 */
export async function acceptRide(
  id: string,
  vehicleId: string,
): Promise<Ride> {
  return normalizeRide(
    (
      await apiFetch<RideWire>(`/rides/${id}/accept`, {
        method: "PATCH",
        body: { status: "accepted", vehicleId },
      })
    ).data,
  );
}

export async function markArrived(id: string): Promise<Ride> {
  return normalizeRide(
    (await apiFetch<RideWire>(`/rides/${id}/arrived`, { method: "PATCH" })).data,
  );
}

export async function startRide(id: string): Promise<Ride> {
  return normalizeRide(
    (await apiFetch<RideWire>(`/rides/${id}/start`, { method: "PATCH" })).data,
  );
}

export async function completeRide(id: string): Promise<Ride> {
  return normalizeRide(
    (await apiFetch<RideWire>(`/rides/${id}/complete`, { method: "PATCH" })).data,
  );
}

export async function cancelRideAsDriver(
  id: string,
  cancellationReason?: string,
): Promise<Ride> {
  return normalizeRide(
    (
      await apiFetch<RideWire>(`/rides/${id}/cancel/driver`, {
        method: "PATCH",
        body: cancellationReason ? { cancellationReason } : {},
      })
    ).data,
  );
}

export async function setOnlineStatus(
  driverId: string,
  isOnline: boolean,
): Promise<void> {
  await apiFetch(`/drivers/${driverId}/online-status`, {
    method: "PATCH",
    body: { isOnline },
  });
}
