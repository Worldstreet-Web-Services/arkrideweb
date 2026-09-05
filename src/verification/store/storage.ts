import type { VerificationData } from "../types";
import * as blobs from "./blobStore";

/**
 * Persistence boundary for the verification SDK.
 *
 * The draft is split across two stores, for the reasons set out in
 * `blobStore.ts`: the text fields go to localStorage (a few kilobytes, sync,
 * keeps the reducer simple) and the document images go to IndexedDB (megabytes,
 * async, quota that is a share of free disk rather than a flat 5 MB).
 *
 * The split happens entirely in here. Nothing in the UI knows about it — a
 * loaded draft comes back with its `dataUrl`s in place, exactly as before.
 *
 * The methods are async because IndexedDB is. `save` returns a result rather
 * than throwing, because a failed autosave is not an exception the caller
 * should have to catch on every keystroke — but it IS something the driver has
 * to be told about, so it can no longer be silently discarded.
 */

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: "quota" | "unavailable" | "unknown"; message: string };

export interface StorageAdapter {
  load(): Promise<VerificationData | null>;
  save(data: VerificationData): Promise<SaveResult>;
  clear(): Promise<void>;
}

const KEY = "arkride.verification.v1";

/**
 * A file slot, as stored in the draft.
 *
 * Matched structurally rather than by a hardcoded list of the 18 known slots,
 * so guarantor documents and the vehicle photo array are handled by the same
 * code, and a new slot needs no change here.
 */
interface FileLike {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

function isFileLike(value: unknown): value is FileLike {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as FileLike).dataUrl === "string" &&
    typeof (value as FileLike).name === "string"
  );
}

/**
 * Only these schemes are ever stored or returned.
 *
 * A `dataUrl` is read back out of browser storage and then rendered into
 * `<img src>` and `<a href>` in both the driver's portal and the reviewer's.
 * Anything that can write to that storage — a compromised extension, a shared
 * machine, or the driver themselves once this is server-backed — could set it
 * to `javascript:…` and have it execute in a reviewer's session on click.
 *
 * Checking the scheme on the way in AND the way out means a value that
 * predates this check, or was written around it, still cannot reach the DOM.
 */
const ALLOWED_PREFIXES = [
  "data:image/jpeg",
  "data:image/jpg",
  "data:image/png",
  "data:image/webp",
  "data:application/pdf",
];

export function isSafeDataUrl(url: unknown): url is string {
  return (
    typeof url === "string" && ALLOWED_PREFIXES.some((p) => url.startsWith(p))
  );
}

/**
 * Walk the draft, swapping every `dataUrl` for a reference.
 *
 * Returns the stripped draft plus the extracted blobs keyed by their path in
 * the object, e.g. `identity.idDocument` or `vehicle.photos.2`. The path is
 * stable across saves, so re-saving overwrites rather than accumulating.
 */
function extract(
  value: unknown,
  path: string,
  out: Map<string, string>,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item, i) => extract(item, `${path}.${i}`, out));
  }

  if (isFileLike(value)) {
    if (!isSafeDataUrl(value.dataUrl)) {
      // Drop rather than store. A slot with an unusable URL reads as "not
      // uploaded", which is recoverable; storing it is not.
      return { ...value, dataUrl: "" };
    }
    out.set(path, value.dataUrl);
    return { ...value, dataUrl: "" };
  }

  if (typeof value === "object" && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = extract(child, path ? `${path}.${key}` : key, out);
    }
    return result;
  }

  return value;
}

/** The inverse: put the blobs back where they came from. */
function rehydrate(
  value: unknown,
  path: string,
  blobsByPath: Map<string, string>,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item, i) => rehydrate(item, `${path}.${i}`, blobsByPath));
  }

  if (isFileLike(value)) {
    const stored = blobsByPath.get(path);
    return { ...value, dataUrl: isSafeDataUrl(stored) ? stored : "" };
  }

  if (typeof value === "object" && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = rehydrate(child, path ? `${path}.${key}` : key, blobsByPath);
    }
    return result;
  }

  return value;
}

export const localStorageAdapter: StorageAdapter = {
  async load() {
    if (typeof window === "undefined") return null;

    let draft: VerificationData;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      draft = JSON.parse(raw) as VerificationData;
    } catch {
      // Truncated or hand-edited. Returning null starts a fresh draft, which
      // is the only safe reading of an unparseable one.
      return null;
    }

    try {
      const stored = await blobs.getAll();
      return rehydrate(draft, "", stored) as VerificationData;
    } catch {
      // The text fields are worth returning even if the documents are not
      // readable — losing nine typed pages because IndexedDB is unavailable
      // would be a worse outcome than showing empty upload slots.
      return draft;
    }
  },

  async save(data) {
    if (typeof window === "undefined") return { ok: true };

    const extracted = new Map<string, string>();
    const stripped = extract(data, "", extracted) as VerificationData;

    try {
      // Documents first. If they fail, the draft is not updated to claim they
      // were stored — the two halves stay consistent.
      await blobs.putAll(extracted);
      await blobs.removeMissing(new Set(extracted.keys()));
    } catch (error) {
      return {
        ok: false,
        reason: isQuotaError(error) ? "quota" : "unavailable",
        message: isQuotaError(error)
          ? "There is not enough space on this device to save your documents. Free up space, or submit from another device."
          : "Your documents could not be saved on this device. They are still here for now, but they will be lost if you close this tab.",
      };
    }

    try {
      window.localStorage.setItem(KEY, JSON.stringify(stripped));
    } catch (error) {
      return {
        ok: false,
        reason: isQuotaError(error) ? "quota" : "unknown",
        message:
          "Your progress could not be saved on this device. It will be lost if you close this tab.",
      };
    }

    return { ok: true };
  },

  async clear() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* Nothing useful to do — the draft is already unreachable. */
    }
    try {
      await blobs.clearAll();
    } catch {
      /* As above. */
    }
  },
};

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" ||
      // Firefox's older name for the same condition.
      error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}
