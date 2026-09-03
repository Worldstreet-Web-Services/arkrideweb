import type { StorageAdapter } from "./store/storage";
import { localStorageAdapter } from "./store/storage";
import type { VerificationData } from "./types";

/**
 * SDK configuration — the seam that keeps the portal decoupled from any host.
 * A consumer overrides `storage` and `onSubmit` to plug in a real backend;
 * the UI never references localStorage or an API directly.
 */
export interface VerificationConfig {
  /** How many guarantors to collect. */
  guarantorCount: number;
  /** Where drafts persist. Defaults to localStorage. */
  storage: StorageAdapter;
  /** Called on final submit. Resolves when the submission is accepted. */
  onSubmit: (data: VerificationData) => Promise<void>;
  /** Where the mobile app / dashboard lives, for the "Back to Dashboard" CTA. */
  dashboardUrl: string;
}

/** Default mock config: localStorage + a simulated submit. */
export const defaultConfig: VerificationConfig = {
  guarantorCount: 1,
  storage: localStorageAdapter,
  onSubmit: async () => {
    // Simulate a network round-trip so the submit button shows its loading state.
    await new Promise((resolve) => setTimeout(resolve, 1200));
  },
  dashboardUrl: "/",
};
