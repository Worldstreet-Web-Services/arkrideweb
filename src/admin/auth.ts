import "server-only";

import { getPrincipal } from "@/lib/api/session";

/**
 * Who is reviewing.
 *
 * This used to return a hardcoded `{ id: "rev-local", name: "Ops Reviewer" }`
 * regardless of who was actually at the keyboard, which meant every approval
 * and rejection in the audit trail was stamped with the same fictional person.
 * On a flow that decides who is allowed to drive, an unattributable decision
 * record is worse than no record.
 *
 * It now reads the real signed-in principal. It is `server-only` on purpose:
 * a reviewer identity that a client component can construct is a reviewer
 * identity an attacker can construct.
 */

export interface Reviewer {
  id: string;
  name: string;
  email: string;
}

/**
 * The signed-in reviewer, or null if there is no session.
 *
 * Callers inside `/admin` can treat null as unreachable — `requireAdmin()` in
 * the layout has already redirected — but it is still returned honestly rather
 * than asserted, so this cannot invent an identity if it is ever called from
 * somewhere unguarded.
 */
export async function getCurrentReviewer(): Promise<Reviewer | null> {
  const principal = await getPrincipal();
  if (!principal) return null;

  return {
    id: principal.id,
    // The API has no `/users/me`, so the name comes from what sign-in
    // returned. Falling back to the email keeps the audit line attributable
    // even when the profile cache is missing.
    name: principal.name || principal.email || principal.id,
    email: principal.email,
  };
}
