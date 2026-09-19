import type { WaitlistUserType } from "@/lib/api/waitlist";

/**
 * The value of a dropdown's "Other" option. It is never sent to the API: the
 * text the person typed under it is sent instead. Not a plausible label, so it
 * cannot collide with a real option.
 */
export const OTHER_VALUE = "__other__";

/**
 * What a person can pick under "What feature would you like to see?".
 *
 * The chosen label itself is what the API stores in `feature`, so the emails
 * and the stored rows read the same whether it was picked or typed. Riders and
 * drivers get different lists because their needs differ.
 */
export const FEATURE_OPTIONS: Record<WaitlistUserType, readonly string[]> = {
  user: [
    "Split a fare with friends",
    "Scheduled and airport rides",
    "Share my trip with family",
    "Book by WhatsApp or voice",
  ],
  driver: [
    "Instant daily payout",
    "Fair, low commission",
    "Fuel-support advances",
    "Ride requests near my area",
  ],
};
