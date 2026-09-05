"use server";

import { revalidatePath } from "next/cache";
import {
  requireAdmin,
  setVerificationStatus,
  setDriverActive,
  type VerificationStatus,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/types";

/**
 * Admin decisions, as Server Actions.
 *
 * WHY THESE ARE NOT `onClick` HANDLERS
 *
 * They used to be. `ApplicationDetail` called `applicationsStore.approve(id)`
 * straight from a button, which meant approving a driver was a local write
 * that nothing checked — no session, no role, no server. The audit line was
 * stamped with a hardcoded name.
 *
 * A Server Action moves the decision to the server, where `requireAdmin()`
 * runs first and the API re-checks the role against the signed token. A
 * non-admin who calls this endpoint directly gets a 403 from the backend, not
 * an approved driver.
 *
 * Every Server Action is a public HTTP endpoint. Being unreachable in the UI
 * is not access control, so the check is inside the action rather than around
 * the button that calls it.
 */

export interface DecisionState {
  ok?: boolean;
  error?: string;
}

/** Approve or reject a driver's verification. */
export async function decideDriverAction(
  driverId: string,
  status: VerificationStatus,
  reason?: string,
): Promise<DecisionState> {
  await requireAdmin();

  if (status === "rejected" && !reason?.trim()) {
    return { error: "Give a reason before rejecting." };
  }

  try {
    await setVerificationStatus(driverId, status, reason?.trim());
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${driverId}`);
  return { ok: true };
}

/**
 * Suspend or reinstate a driver.
 *
 * Suspension also revokes the driver's refresh tokens server-side, so they are
 * signed out everywhere rather than merely blocked at next login.
 */
export async function setDriverActiveAction(
  driverId: string,
  isActive: boolean,
  reason?: string,
): Promise<DecisionState> {
  await requireAdmin();

  try {
    await setDriverActive(driverId, isActive, reason?.trim());
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${driverId}`);
  return { ok: true };
}
