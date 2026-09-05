import type { VerificationData } from "@/verification/types";
import type { Application, ReviewOutcome, SectionFlag } from "../types";
import { seedApplications } from "./seed";

/**
 * Client-side applications store (simulation — no backend).
 *
 * Persists the list to localStorage and notifies subscribers on change. Swap
 * these methods for API calls later; the component layer only talks to the
 * `useApplications` / `useApplication` hooks, so the UI won't change.
 */

const KEY = "arkride.applications.v1";

/**
 * A collision-free application id.
 *
 * `crypto.randomUUID` needs a secure context, which is every browser this runs
 * in except plain-HTTP staging hosts, so there is a fallback.
 */
function newApplicationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `app-${crypto.randomUUID()}`;
  }
  return `app-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

let cache: Application[] | null = null;
const listeners = new Set<() => void>();

function read(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Application[];
  } catch {
    /* fall through to seed */
  }
  const seeded = seedApplications();
  write(seeded);
  return seeded;
}

function write(list: Application[]): void {
  cache = list;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      /* quota — keep in-memory copy */
    }
  }
  listeners.forEach((l) => l());
}

function ensure(): Application[] {
  if (cache === null) cache = read();
  return cache;
}

export const applicationsStore = {
  subscribe(cb: () => void): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  list(): Application[] {
    return [...ensure()].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  },

  get(id: string): Application | undefined {
    return ensure().find((a) => a.id === id);
  },

  /** Append a freshly-submitted driver application (from the /verify portal). */
  add(data: VerificationData, submittedAt: string): Application {
    const list = ensure();
    const app: Application = {
      // Was `app-${1042 + list.length + 1}` — derived from position, so a
      // single deletion or reorder produces a duplicate id on a KYC record.
      id: newApplicationId(),
      submittedAt,
      status: "submitted",
      data: { ...data, status: "submitted" },
    };
    write([app, ...list]);
    return app;
  },

  approve(id: string, reviewer: string): void {
    decide(id, { outcome: "approved", reviewer });
  },

  reject(id: string, reason: string, reviewer: string): void {
    decide(id, { outcome: "rejected", reason, reviewer });
  },

  requestChanges(id: string, flags: SectionFlag[], reviewer: string): void {
    decide(id, { outcome: "changes_requested", flags, reviewer });
  },

  /** Test/util: wipe local data and reseed. */
  resetToSeed(): void {
    write(seedApplications());
  },
};

/**
 * Record a decision locally.
 *
 * `reviewer` is passed in rather than looked up. This module runs in the
 * browser, and a reviewer identity that browser code can produce is one an
 * attacker can produce — which is exactly how every decision here used to end
 * up stamped with the same fictional "Ops Reviewer". The real identity comes
 * from the server session and is threaded down as a prop.
 *
 * This is the local mirror of the decision, not the decision itself: the
 * authoritative write is the Server Action in `src/app/admin/actions.ts`,
 * which the API authorises against the caller's token.
 */
function decide(
  id: string,
  partial: {
    outcome: ReviewOutcome;
    reason?: string;
    flags?: SectionFlag[];
    reviewer: string;
  }
): void {
  const reviewedAt = new Date().toISOString();
  // VerificationData.status has no "changes_requested" — record it as "rejected"
  // on the snapshot so the driver's portal reads it as "action required".
  const dataStatus = partial.outcome === "changes_requested" ? "rejected" : partial.outcome;
  const next: Application[] = ensure().map((a) =>
    a.id === id
      ? {
          ...a,
          status: partial.outcome,
          data: { ...a.data, status: dataStatus },
          decision: {
            outcome: partial.outcome,
            reason: partial.reason,
            flags: partial.flags,
            reviewedAt,
            reviewer: partial.reviewer,
          },
        }
      : a
  );
  write(next);
}
