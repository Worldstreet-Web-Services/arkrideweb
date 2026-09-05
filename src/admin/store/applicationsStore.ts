import type { VerificationData } from "@/verification/types";
import * as blobs from "@/verification/store/blobStore";
import { extractBlobs, rehydrateBlobs } from "@/verification/store/blobSplit";
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

/** Memoised sort for `list()` — see the note there. */
let sortedCache: Application[] | null = null;
let sortedSource: Application[] | null = null;

/**
 * Document blobs, held in memory and backed by IndexedDB.
 *
 * The applications written here carry the same 18 base64 identity documents as
 * the driver's draft — roughly 5.5 MB — and `write()` put all of it into
 * localStorage against a ~5 MB quota, catching the failure into an empty
 * block. The result: `write()` set the in-memory cache BEFORE the failing
 * `setItem`, so /admin in the same tab showed the application while /admin in
 * a new tab did not, and the driver had already been shown "Verification
 * Submitted".
 *
 * The blobs now live in IndexedDB. This map is the synchronous view of them,
 * so `list()` and `get()` keep their sync signatures — which is what lets the
 * hooks stay `useSyncExternalStore`. It hydrates once, asynchronously, and
 * notifies subscribers when it lands, so previews appear a beat after the
 * rest of the record rather than not at all.
 */
let docs: Map<string, string> = new Map();
let docsHydrated = false;
let docsLoading = false;

function hydrateDocs(): void {
  if (docsHydrated || docsLoading || typeof window === "undefined") return;
  docsLoading = true;

  void blobs
    .getAll(blobs.APPLICATION_STORE)
    .then((loaded) => {
      docs = loaded;
    })
    .catch(() => {
      // Documents unreadable. The text of the application is still reviewable,
      // and empty previews are a better outcome than an unrenderable page.
    })
    .finally(() => {
      docsHydrated = true;
      docsLoading = false;
      sortedCache = null;
      listeners.forEach((fn) => fn());
    });
}
const listeners = new Set<() => void>();

/**
 * Read the queue.
 *
 * A parse failure used to fall through to `write(seedApplications())` —
 * destroying the entire real review queue and replacing it with six fictional
 * applicants. One truncated write (which is exactly what a quota failure
 * produces) was enough to lose every pending application and silently
 * substitute demo data that a reviewer could then approve.
 *
 * Unreadable data is now left alone and reported as empty. Seeding happens
 * only when the key is genuinely absent, i.e. a first visit.
 */
function read(): Application[] {
  if (typeof window === "undefined") return [];

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // Storage disabled entirely (some private modes). Nothing to read, and
    // nothing worth writing either.
    return [];
  }

  if (raw === null) {
    const seeded = seedApplications();
    write(seeded);
    return seeded;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    // Validated rather than cast: an `as Application[]` on a malformed value
    // pushes the failure downstream, where `data.guarantors.map` throws during
    // render and takes the whole page with it.
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a): a is Application =>
        typeof a === "object" && a !== null && typeof (a as Application).id === "string",
    );
  } catch {
    // Corrupt. Do NOT overwrite it — a reviewer may be able to recover it, and
    // replacing it with seed data guarantees they cannot.
    return [];
  }
}

/**
 * Keep other tabs in step.
 *
 * The module-level `cache` is per tab and nothing invalidated it, so two open
 * tabs each held their own copy: approving in one and rejecting in the other
 * wrote a whole stale array over the fresh one, silently discarding the first
 * decision. The `storage` event fires in every OTHER tab on the origin, which
 * is exactly the signal needed.
 */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== KEY) return;
    cache = null;
    sortedCache = null;
    listeners.forEach((fn) => fn());
  });
}

/**
 * Persist the queue.
 *
 * Throws on a storage failure rather than swallowing it. The old version set
 * the in-memory cache first and then discarded the error, so a quota failure
 * produced an application that existed in one tab and nowhere else — while the
 * driver was shown a success screen.
 *
 * With the documents moved to IndexedDB this payload is a few kilobytes, so a
 * quota failure here now means something genuinely wrong, and the caller
 * surfaces it.
 */
function write(list: Application[]): void {
  if (typeof window !== "undefined") {
    // Write BEFORE updating the cache, so the cache never claims a state that
    // storage does not hold.
    window.localStorage.setItem(KEY, JSON.stringify(list));
  }
  cache = list;
  sortedCache = null;
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

  /**
   * The queue, newest first.
   *
   * The sorted array is memoised against the underlying cache. This matters:
   * `useSyncExternalStore` compares snapshots by identity, so returning a
   * freshly-sorted copy on every call would report a change on every render
   * and loop forever. `sortedCache` is cleared by `write()` and by the
   * cross-tab storage listener, i.e. exactly when the data actually changes.
   */
  list(): Application[] {
    hydrateDocs();
    const current = ensure();
    if (sortedCache === null || sortedSource !== current) {
      sortedSource = current;
      sortedCache = [...current]
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
        .map((a) => rehydrateBlobs(a, docs, a.id));
    }
    return sortedCache;
  },

  get(id: string): Application | undefined {
    hydrateDocs();
    // Read through `list()` so the returned object is the SAME instance the
    // list holds. `useSyncExternalStore` compares by identity, and a freshly
    // rehydrated copy on every call would re-render without end.
    return this.list().find((a) => a.id === id);
  },

  /**
   * Append a freshly-submitted driver application (from the /verify portal).
   *
   * Async because the documents go to IndexedDB. They are written FIRST: if
   * that fails, the application is not recorded at all, rather than recorded
   * as a row whose evidence was never stored.
   */
  async add(data: VerificationData, submittedAt: string): Promise<Application> {
    const list = ensure();
    const id = newApplicationId();

    const extracted = new Map<string, string>();
    // Keyed under the application id so several applications coexist, and so
    // purging the driver's draft cannot touch them.
    const stripped = extractBlobs({ ...data, status: "submitted" }, extracted, id);

    await blobs.putAll(blobs.APPLICATION_STORE, extracted);
    for (const [k, v] of extracted) docs.set(k, v);

    const app: Application = {
      // Was `app-${1042 + list.length + 1}` — derived from position, so a
      // single deletion or reorder produces a duplicate id on a KYC record.
      id,
      submittedAt,
      status: "submitted",
      data: stripped as VerificationData,
    };

    write([app, ...list]);
    return { ...app, data };
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
  const next: Application[] = ensure().map((a) =>
    a.id === id
      ? {
          ...a,
          status: partial.outcome,
          data: { ...a.data, status: partial.outcome },
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
