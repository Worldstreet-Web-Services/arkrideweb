import type { VerificationData } from "../types";

/**
 * Persistence boundary for the verification SDK.
 *
 * The portal only knows this interface — swap `localStorageAdapter` for an
 * API-backed adapter later without touching any UI. Methods are sync to keep
 * the reducer simple; an async backend can wrap writes in fire-and-forget.
 */
export interface StorageAdapter {
  load(): VerificationData | null;
  save(data: VerificationData): void;
  clear(): void;
}

const KEY = "arkride.verification.v1";

/** Default adapter — persists the whole draft to localStorage. */
export const localStorageAdapter: StorageAdapter = {
  load() {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as VerificationData) : null;
    } catch {
      return null;
    }
  },
  save(data) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // Quota exceeded (large image previews). Fail quietly — the in-memory
      // state stays intact; only cross-session resume is lost.
    }
  },
  clear() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* no-op */
    }
  },
};
