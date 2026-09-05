import "server-only";

import { api } from "./client";

/**
 * Public marketing numbers, from `GET /api/v1/stats/public`.
 *
 * The backend deliberately rounds these DOWN to a milestone before returning
 * them (`roundDownToMilestone` in its stats service) — an exact registered-user
 * count is a business metric a competitor can poll daily to derive a growth
 * curve, and on low volume the pickup addresses it used to return were
 * individual riders' homes. So these are already safe to render publicly; do
 * not "improve" them by reaching for a more precise endpoint.
 */
export interface PublicStats {
  completedRides: number;
  activeDrivers: number;
  riders: number;
  coverageAreas: number;
  vehicleTypesOffered: string[];
  rideCategoriesOffered: string[];
}

/**
 * Cached for 5 minutes. Marketing numbers do not need to be live, and an
 * uncached call would make the landing page hit the API on every request —
 * including for crawlers.
 */
export async function getPublicStats(): Promise<PublicStats | null> {
  try {
    return await api<PublicStats>("/stats/public", {
      auth: false,
      revalidate: 300,
      tags: ["public-stats"],
    });
  } catch {
    // The landing page must render when the API is down. A marketing site that
    // 500s because a stats endpoint is unreachable is worse than one showing no
    // numbers, so the caller treats null as "omit the section".
    return null;
  }
}
