import type { VerificationData } from "@/verification/types";

/**
 * Admin review models — wrap a submitted VerificationData snapshot with the
 * reviewer's decision. The verification module stays unaware of review; the
 * admin module depends on it, never the reverse.
 */

export type ApplicationStatus = "submitted" | "approved" | "rejected" | "changes_requested";

export type ReviewOutcome = "approved" | "rejected" | "changes_requested";

/** A specific thing the reviewer wants the driver to fix (drives resubmission). */
export interface SectionFlag {
  section: string; // e.g. "license"
  label: string; // human label, e.g. "Driver's License · Front image"
  note: string; // what's wrong / what to do
}

export interface ReviewDecision {
  outcome: ReviewOutcome;
  reason?: string; // rejection reason
  flags?: SectionFlag[]; // requested changes
  reviewedAt: string; // ISO
  reviewer?: string; // reviewer display name
}

export interface Application {
  id: string;
  submittedAt: string; // ISO
  data: VerificationData; // submitted snapshot
  status: ApplicationStatus;
  decision?: ReviewDecision;
}

/** Applicant's display name, falling back gracefully. */
export function applicantName(a: Application): string {
  const p = a.data.personal;
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ") || "Unnamed applicant";
}

/** Short vehicle descriptor for the queue, e.g. "Toyota Corolla · ABC-123-XY". */
export function vehicleSummary(a: Application): string {
  const v = a.data.vehicle;
  const car = [v.make, v.model].filter(Boolean).join(" ");
  return [car, v.plateNumber].filter(Boolean).join(" · ") || "—";
}
