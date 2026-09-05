"use server";

import { revalidatePath } from "next/cache";
import {
  bookRide,
  getRide,
  cancelRideAsRider,
  estimateRide,
  acceptRide,
  markArrived,
  startRide,
  completeRide,
  cancelRideAsDriver,
  setOnlineStatus,
  rateRide,
  triggerSos,
  type RideCategory,
  type RideLocation,
  type RideOption,
} from "@/lib/api/rides";
import { getPrincipal } from "@/lib/api/session";
import { ApiError } from "@/lib/api/types";

/**
 * Server Actions for booking and driving.
 *
 * Every one of these is a public HTTP endpoint whether or not the UI links to
 * it, so none of them assumes the caller reached it through the intended
 * screen. Authorisation is the API's — these forward the caller's token and
 * report what it says.
 */

export interface ActionState<T = undefined> {
  ok?: boolean;
  error?: string;
  data?: T;
}

function fail(error: unknown): ActionState<never> {
  if (error instanceof ApiError) {
    if (error.isRateLimited) {
      return { error: "You're going a bit fast. Wait a moment and try again." };
    }
    return { error: error.message };
  }
  return { error: "Something went wrong. Please try again." };
}

/* ------------------------------------------------------------------ riders */

export async function estimateAction(
  pickup: RideLocation,
  dropoff: RideLocation,
): Promise<ActionState<RideOption[]>> {
  // Estimating requires a rider token — there is no anonymous quote endpoint.
  const principal = await getPrincipal();
  if (!principal) return { error: "Please sign in to see fares." };

  try {
    return { ok: true, data: await estimateRide(pickup, dropoff) };
  } catch (error) {
    return fail(error);
  }
}

export async function bookRideAction(input: {
  pickup: RideLocation;
  dropoff: RideLocation;
  category: RideCategory;
}): Promise<ActionState<{ id: string }>> {
  try {
    const ride = await bookRide(input);
    revalidatePath("/app");
    return { ok: true, data: { id: ride.id } };
  } catch (error) {
    return fail(error);
  }
}

export async function cancelRideAction(
  rideId: string,
  reason?: string,
): Promise<ActionState> {
  try {
    await cancelRideAsRider(rideId, reason);
    revalidatePath("/app");
    revalidatePath(`/app/rides/${rideId}`);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function rateRideAction(
  rideId: string,
  rating: number,
  comment?: string,
): Promise<ActionState> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Choose a rating from 1 to 5." };
  }

  // The ratee is read from the ride on the server rather than passed in from
  // the browser. A client-supplied `rateeId` would let anyone attach a
  // one-star review to a driver they never rode with.
  const ride = await getRide(rideId).catch(() => null);
  if (!ride?.driver?.id) {
    return { error: "That trip has no driver to rate." };
  }

  try {
    await rateRide({
      rideId,
      rateeId: ride.driver.id,
      rateeType: "driver",
      rating,
      comment: comment?.trim() || undefined,
    });
    revalidatePath(`/app/rides/${rideId}`);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/**
 * Raise an emergency on an active ride.
 *
 * Deliberately does not confirm-then-send: the whole point is that it fires on
 * the first press. The UI holds the confirmation step instead, so a pocket
 * press does not trigger it, but once the user has confirmed there is no
 * second round trip.
 */
export async function sosAction(rideId: string): Promise<ActionState> {
  try {
    await triggerSos(rideId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ----------------------------------------------------------------- drivers */

export async function acceptRideAction(
  rideId: string,
  vehicleId: string,
): Promise<ActionState> {
  if (!vehicleId) {
    return {
      error:
        "No vehicle is registered to your account. Add one before accepting rides.",
    };
  }

  try {
    await acceptRide(rideId, vehicleId);
    revalidatePath("/driver");
    return { ok: true };
  } catch (error) {
    // Another driver getting there first is a normal outcome on a shared
    // pool, not a fault — say so plainly rather than showing a raw conflict.
    if (error instanceof ApiError && error.statusCode === 409) {
      return { error: "Another driver took that ride." };
    }
    return fail(error);
  }
}

export async function driverAdvanceAction(
  rideId: string,
  to: "arrived" | "in_progress" | "completed",
): Promise<ActionState> {
  try {
    if (to === "arrived") await markArrived(rideId);
    else if (to === "in_progress") await startRide(rideId);
    else await completeRide(rideId);

    revalidatePath("/driver");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function driverCancelAction(
  rideId: string,
  reason?: string,
): Promise<ActionState> {
  try {
    await cancelRideAsDriver(rideId, reason);
    revalidatePath("/driver");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/**
 * Go online or offline.
 *
 * The API refuses to put a driver online unless they are approved AND active,
 * so an unapproved driver toggling this gets a clear refusal rather than a
 * silent no-op. The dashboard reads `verificationStatus` and does not render
 * the control at all until they are approved — this check is the backstop.
 */
export async function setOnlineAction(
  isOnline: boolean,
): Promise<ActionState> {
  const principal = await getPrincipal();
  if (!principal || principal.role !== "driver") {
    return { error: "Only drivers can go online." };
  }

  try {
    await setOnlineStatus(principal.id, isOnline);
    revalidatePath("/driver");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
