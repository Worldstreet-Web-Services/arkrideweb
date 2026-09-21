import posthog from "posthog-js";

/**
 * Every event this app sends, in one place.
 *
 * A closed list on purpose. An event name typed inline at a call site is how
 * "waitlist_joined" and "waitlistJoined" end up as two lines on one chart, and
 * how a property that should never have been sent gets added without anyone
 * reading a list. Add the name here first.
 *
 * NEVER a name, email, phone number or the free-text "feature" answer — see
 * `src/instrumentation-client.ts`. Properties are coarse and categorical.
 */
export type AnalyticsEvent =
  | "waitlist_dialog_opened"
  | "waitlist_joined"
  | "waitlist_join_failed";

type Properties = Record<string, string | number | boolean | null>;

/**
 * Record an event. A no-op when PostHog is not configured (or not yet loaded),
 * and never throws: a failure to measure must not become a failure to sign up.
 */
export function track(event: AnalyticsEvent, properties?: Properties): void {
  if (typeof window === "undefined" || !posthog.__loaded) return;

  try {
    posthog.capture(event, properties);
  } catch {
    // Deliberately swallowed. There is nothing useful to do with it here.
  }
}
