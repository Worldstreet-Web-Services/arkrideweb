import type { VerificationData } from "../types";
import * as blobs from "./blobStore";
import { extractBlobs, rehydrateBlobs, isSafeDataUrl } from "./blobSplit";

export { isSafeDataUrl };

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
      const stored = await blobs.getAll(blobs.DRAFT_STORE);
      return rehydrateBlobs(draft, stored);
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
    const stripped = extractBlobs(data, extracted);

    try {
      // Documents first. If they fail, the draft is not updated to claim they
      // were stored — the two halves stay consistent.
      await blobs.putAll(blobs.DRAFT_STORE, extracted);
      await blobs.removeMissing(blobs.DRAFT_STORE, new Set(extracted.keys()));
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
      await blobs.clearAll(blobs.DRAFT_STORE);
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
