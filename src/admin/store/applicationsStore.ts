import type { VerificationData } from "@/verification/types";
import { getCurrentReviewer } from "../auth";
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
    const n = list.length + 1;
    const app: Application = {
      id: `app-${1042 + n}`,
      submittedAt,
      status: "submitted",
      data: { ...data, status: "submitted" },
    };
    write([app, ...list]);
    return app;
  },

  approve(id: string): void {
    decide(id, { outcome: "approved" });
  },

  reject(id: string, reason: string): void {
    decide(id, { outcome: "rejected", reason });
  },

  requestChanges(id: string, flags: SectionFlag[]): void {
    decide(id, { outcome: "changes_requested", flags });
  },

  /** Test/util: wipe local data and reseed. */
  resetToSeed(): void {
    write(seedApplications());
  },
};

function decide(
  id: string,
  partial: { outcome: ReviewOutcome; reason?: string; flags?: SectionFlag[] }
): void {
  const reviewer = getCurrentReviewer();
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
            reviewer: reviewer.name,
          },
        }
      : a
  );
  write(next);
}
