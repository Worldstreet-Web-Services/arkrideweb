import "server-only";

import { redirect } from "next/navigation";
import { apiFetch } from "./client";
import { getPrincipal } from "./session";
import { ApiError } from "./types";
import type { Principal } from "./auth";

/**
 * Admin authorisation and the driver review queue.
 *
 * HOW ADMIN ACCESS IS ACTUALLY DECIDED
 *
 * Not by reading `role` off the token. That claim is unverified here — the
 * frontend never checks the signature — so trusting it would mean anyone who
 * can write a cookie is an admin.
 *
 * Instead `requireAdmin()` calls an endpoint the API itself restricts to
 * admins (`GET /drivers` is `@Roles(ADMIN)`) and treats the answer as the
 * verdict. A 403 means the backend, holding the signing secret, has decided
 * this token is not an admin. That is a real authorisation check, and it stays
 * correct even if someone forges a cookie or the proxy is bypassed entirely.
 *
 * It also means the check and the data arrive together — the queue page needs
 * this list anyway, so proving access costs no extra request.
 */

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface Vehicle {
  id: string;
  type: "keke" | "bike" | "car" | "courier";
  plateNumber: string;
  color: string;
  model: string;
  year: number;
}

/** A driver as the admin endpoints return them — never includes `password`. */
export interface AdminDriver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  verificationStatus: VerificationStatus;
  isActive: boolean;
  isOnline: boolean;
  ratingAverage: number | null;
  totalCompletedRides: number;
  walletBalance: number;
  privyDid?: string | null;
  walletAddressEvm?: string | null;
  vehicles?: Vehicle[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminContext {
  admin: Principal;
  drivers: AdminDriver[];
}

/**
 * Prove the caller is an admin, and return the driver queue.
 *
 * Redirects rather than throwing, because every caller is a page and the only
 * sensible response to "you are not an admin" is to stop rendering.
 *
 * Note that `redirect()` works by throwing a control-flow signal that Next
 * catches, so it must not be called inside the `try` — the catch would swallow
 * it and the page would render for an unauthorised visitor.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const admin = await getPrincipal();
  if (!admin) redirect("/admin/login");

  let drivers: AdminDriver[];

  try {
    drivers = await fetchDrivers();
  } catch (error) {
    if (error instanceof ApiError) {
      // 401: no session, or it expired. 403: signed in, but not an admin.
      // Both end at the sign-in page; only the message differs.
      if (error.statusCode === 401) redirect("/admin/login?reason=expired");
      if (error.statusCode === 403) redirect("/admin/login?reason=forbidden");
    }
    // Anything else — the API is down, the network failed — is a real fault.
    // Let it reach the error boundary rather than pretending it is a denial,
    // which would send an actual admin to a sign-in page that will not help.
    throw error;
  }

  return { admin, drivers };
}

/**
 * The full driver list.
 *
 * `GET /drivers` takes no query parameters and has no pagination — it returns
 * every driver, newest first, and its `meta.total` is just the array length,
 * not a database count. Filtering by status therefore has to happen here.
 * That is fine at ArkRide's current size and will need a backend change before
 * it is not.
 */
export async function fetchDrivers(): Promise<AdminDriver[]> {
  return (
    await apiFetch<AdminDriver[]>("/drivers", { cache: "no-store" })
  ).data;
}

export async function fetchDriver(id: string): Promise<AdminDriver> {
  return (await apiFetch<AdminDriver>(`/drivers/${id}`, { cache: "no-store" })).data;
}

/**
 * Approve or reject a driver.
 *
 * KNOWN GAP: the API's DTO accepts a `reason`, but its controller forwards
 * only the status — the rejection reason is accepted and then silently
 * dropped, so a rejected driver is never told why. It is sent anyway so this
 * starts working the moment the controller is fixed, but do not build UI that
 * promises the driver will see it.
 */
export async function setVerificationStatus(
  driverId: string,
  status: VerificationStatus,
  reason?: string,
): Promise<AdminDriver> {
  return (
    await apiFetch<AdminDriver>(`/drivers/${driverId}/verification-status`, {
      method: "PATCH",
      body: { status, ...(reason ? { reason } : {}) },
    })
  ).data;
}

/**
 * Suspend or reinstate a driver.
 *
 * Suspending also revokes the driver's refresh tokens server-side, so they are
 * signed out of every device rather than merely blocked at the next login.
 */
export async function setDriverActive(
  driverId: string,
  isActive: boolean,
  reason?: string,
): Promise<AdminDriver> {
  return (
    await apiFetch<AdminDriver>(`/drivers/${driverId}/active-status`, {
      method: "PATCH",
      body: { isActive, ...(reason ? { reason } : {}) },
    })
  ).data;
}

/** Split the queue the way the dashboard shows it. */
export function partitionByStatus(drivers: AdminDriver[]) {
  return {
    pending: drivers.filter((d) => d.verificationStatus === "pending"),
    approved: drivers.filter((d) => d.verificationStatus === "approved"),
    rejected: drivers.filter((d) => d.verificationStatus === "rejected"),
  };
}
