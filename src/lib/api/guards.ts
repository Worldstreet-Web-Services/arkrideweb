import "server-only";

import { redirect } from "next/navigation";
import { getPrincipal } from "./session";
import type { Principal } from "./auth";

/**
 * Page guards for the signed-in surfaces.
 *
 * These check the ROLE CLAIM, which is not verified here — so unlike
 * `requireAdmin`, they are not a security boundary. They exist to route people
 * to the right place, and every piece of data behind them comes from an
 * endpoint the API authorises independently. A rider who forged a driver
 * cookie would reach the driver dashboard and then see nothing but 403s,
 * because the API decides what it returns.
 *
 * That is the correct division: the frontend decides what to render, the
 * backend decides what exists. `requireAdmin` is stricter only because /admin
 * is worth one extra round trip to get right.
 */

export async function requireRider(next: string): Promise<Principal> {
  const principal = await getPrincipal();
  if (!principal) redirect(`/login?next=${encodeURIComponent(next)}`);
  // A driver landing on the rider app is a wrong turn, not an attack.
  if (principal.role === "driver") redirect("/driver");
  return principal;
}

export async function requireDriver(next: string): Promise<Principal> {
  const principal = await getPrincipal();
  if (!principal) redirect(`/driver-login?next=${encodeURIComponent(next)}`);
  if (principal.role !== "driver") redirect("/app");
  return principal;
}
