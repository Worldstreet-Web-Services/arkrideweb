/**
 * Auth seam for the admin dashboard.
 *
 * ⚠️ NOT SECURE YET. `/admin` is currently open — this file is only a seam so
 * the rest of the code already reads "who is the reviewer" from one place.
 *
 * To lock it down when the backend lands, replace `getCurrentReviewer()` with a
 * real session lookup (Clerk / Supabase Auth), enforce it in `middleware.ts`
 * on `/admin/*`, and gate the review actions on the server. Nothing else in the
 * admin module needs to change.
 */

export interface Reviewer {
  id: string;
  name: string;
  email: string;
}

/** Placeholder reviewer identity — swap for a real authenticated session. */
export function getCurrentReviewer(): Reviewer {
  return {
    id: "rev-local",
    name: "Ops Reviewer",
    email: "reviewer@arkride.local",
  };
}
